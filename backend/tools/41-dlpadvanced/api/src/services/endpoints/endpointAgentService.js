/**
 * Endpoint Agent Service
 * Monitors endpoint activities - USB, clipboard, print, screen capture, file access
 */

const { EventEmitter } = require('events');

class EndpointAgentService extends EventEmitter {
  constructor() {
    super();
    this.connectedAgents = new Map();
    this.activityBuffer = [];
    this.bufferFlushInterval = 5000; // 5 seconds
  }
  
  // ==========================================
  // Agent Management
  // ==========================================
  
  /**
   * Register endpoint agent
   */
  registerAgent(agentId, metadata) {
    const agent = {
      id: agentId,
      hostname: metadata.hostname,
      os: metadata.os,
      username: metadata.username,
      ipAddress: metadata.ipAddress,
      agentVersion: metadata.agentVersion,
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      status: 'active',
      policies: []
    };
    
    this.connectedAgents.set(agentId, agent);
    this.emit('agent:registered', agent);
    
    return agent;
  }
  
  /**
   * Update agent heartbeat
   */
  updateHeartbeat(agentId) {
    const agent = this.connectedAgents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
      agent.status = 'active';
    }
  }
  
  /**
   * Get all connected agents
   */
  getConnectedAgents() {
    return Array.from(this.connectedAgents.values());
  }
  
  /**
   * Deactivate stale agents (no heartbeat in 5 minutes)
   */
  cleanupStaleAgents() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    for (const [agentId, agent] of this.connectedAgents) {
      if (agent.lastHeartbeat < fiveMinutesAgo) {
        agent.status = 'inactive';
        this.emit('agent:inactive', agent);
      }
    }
  }
  
  // ==========================================
  // Activity Processing
  // ==========================================
  
  /**
   * Process incoming activity from endpoint agent
   */
  async processActivity(agentId, activity, dlpService) {
    const agent = this.connectedAgents.get(agentId);
    if (!agent) {
      console.warn(`Unknown agent: ${agentId}`);
      return { processed: false, reason: 'unknown_agent' };
    }
    
    const enrichedActivity = {
      ...activity,
      agentId,
      hostname: agent.hostname,
      username: agent.username,
      processedAt: new Date()
    };
    
    // Scan activity content for sensitive data
    let scanResult = null;
    if (activity.content) {
      scanResult = await dlpService.scanContent(activity.content);
      enrichedActivity.dlpFindings = scanResult;
    }
    
    // Store activity
    this.activityBuffer.push(enrichedActivity);
    
    // Check if violation
    if (scanResult?.totalFindings > 0) {
      const incident = {
        type: 'endpoint_violation',
        activity: enrichedActivity,
        riskScore: scanResult.riskScore,
        findings: scanResult.findings
      };
      
      this.emit('violation', incident);
      
      // Determine action
      return await this.handleViolation(enrichedActivity, scanResult);
    }
    
    return { processed: true, allowed: true };
  }
  
  /**
   * Handle DLP violation
   */
  async handleViolation(activity, scanResult) {
    const action = this.determineAction(activity.type, scanResult.riskScore);
    
    const response = {
      processed: true,
      allowed: action.allow,
      action: action.type,
      reason: action.reason
    };
    
    // If blocking, add user message
    if (!action.allow) {
      response.userMessage = this.getUserMessage(activity.type, scanResult);
    }
    
    return response;
  }
  
  /**
   * Determine action based on activity type and risk score
   */
  determineAction(activityType, riskScore) {
    const policies = {
      usb_write: { blockThreshold: 50, auditThreshold: 0 },
      clipboard_copy: { blockThreshold: 70, auditThreshold: 30 },
      print: { blockThreshold: 60, auditThreshold: 20 },
      screen_capture: { blockThreshold: 80, auditThreshold: 40 },
      file_upload: { blockThreshold: 50, auditThreshold: 0 },
      email_attachment: { blockThreshold: 60, auditThreshold: 20 }
    };
    
    const policy = policies[activityType] || { blockThreshold: 70, auditThreshold: 30 };
    
    if (riskScore >= policy.blockThreshold) {
      return { type: 'block', allow: false, reason: 'High risk sensitive data detected' };
    } else if (riskScore >= policy.auditThreshold) {
      return { type: 'audit', allow: true, reason: 'Activity logged for review' };
    }
    
    return { type: 'allow', allow: true, reason: 'No policy violation' };
  }
  
  /**
   * Generate user-friendly message for blocked action
   */
  getUserMessage(activityType, scanResult) {
    const dataTypes = scanResult.findings.map(f => f.type).join(', ');
    
    const messages = {
      usb_write: `This file cannot be copied to USB. Sensitive data detected: ${dataTypes}`,
      clipboard_copy: `Clipboard copy blocked. Detected sensitive information: ${dataTypes}`,
      print: `Printing blocked. Document contains sensitive data: ${dataTypes}`,
      screen_capture: `Screen capture blocked. Visible content contains: ${dataTypes}`,
      file_upload: `File upload blocked. Contains sensitive data: ${dataTypes}`,
      email_attachment: `Attachment blocked. Contains sensitive information: ${dataTypes}`
    };
    
    return messages[activityType] || `Action blocked due to sensitive data: ${dataTypes}`;
  }
  
  // ==========================================
  // Activity Types Handlers
  // ==========================================
  
  /**
   * Handle USB activity
   */
  async handleUSBActivity(agentId, data, dlpService) {
    return this.processActivity(agentId, {
      type: 'usb_write',
      deviceId: data.deviceId,
      deviceName: data.deviceName,
      filePath: data.filePath,
      fileName: data.fileName,
      fileSize: data.fileSize,
      content: data.content,
      timestamp: new Date()
    }, dlpService);
  }
  
  /**
   * Handle clipboard activity
   */
  async handleClipboardActivity(agentId, data, dlpService) {
    return this.processActivity(agentId, {
      type: 'clipboard_copy',
      application: data.application,
      content: data.content,
      contentType: data.contentType,
      timestamp: new Date()
    }, dlpService);
  }
  
  /**
   * Handle print activity
   */
  async handlePrintActivity(agentId, data, dlpService) {
    return this.processActivity(agentId, {
      type: 'print',
      printerName: data.printerName,
      documentName: data.documentName,
      pageCount: data.pageCount,
      content: data.content,
      timestamp: new Date()
    }, dlpService);
  }
  
  /**
   * Handle screen capture attempt
   */
  async handleScreenCapture(agentId, data, dlpService) {
    return this.processActivity(agentId, {
      type: 'screen_capture',
      application: data.application,
      windowTitle: data.windowTitle,
      content: data.ocrText, // OCR text from screenshot
      timestamp: new Date()
    }, dlpService);
  }
  
  /**
   * Handle file access/modification
   */
  async handleFileActivity(agentId, data, dlpService) {
    return this.processActivity(agentId, {
      type: 'file_access',
      action: data.action, // read, write, delete, rename
      filePath: data.filePath,
      fileName: data.fileName,
      application: data.application,
      content: data.content,
      timestamp: new Date()
    }, dlpService);
  }
  
  // ==========================================
  // Policy Distribution
  // ==========================================
  
  /**
   * Push policies to agent
   */
  pushPolicies(agentId, policies) {
    const agent = this.connectedAgents.get(agentId);
    if (agent) {
      agent.policies = policies;
      
      // Emit event for WebSocket to send to agent
      this.emit('policy:update', { agentId, policies });
      
      return true;
    }
    return false;
  }
  
  /**
   * Push policies to all agents
   */
  broadcastPolicies(policies) {
    for (const [agentId] of this.connectedAgents) {
      this.pushPolicies(agentId, policies);
    }
  }
  
  // ==========================================
  // Activity Flush to Database
  // ==========================================
  
  /**
   * Start activity buffer flush interval
   */
  startBufferFlush(database) {
    setInterval(async () => {
      if (this.activityBuffer.length === 0) return;
      
      const activities = [...this.activityBuffer];
      this.activityBuffer = [];
      
      try {
        await database.collection('endpoint_activities').insertMany(activities);
      } catch (error) {
        console.error('Failed to flush activity buffer:', error.message);
        // Put back in buffer for retry
        this.activityBuffer.unshift(...activities);
      }
    }, this.bufferFlushInterval);
  }
  
  // ==========================================
  // Analytics
  // ==========================================
  
  /**
   * Get activity statistics
   */
  getActivityStats() {
    const stats = {
      connectedAgents: this.connectedAgents.size,
      activeAgents: 0,
      bufferedActivities: this.activityBuffer.length,
      byType: {}
    };
    
    for (const agent of this.connectedAgents.values()) {
      if (agent.status === 'active') stats.activeAgents++;
    }
    
    for (const activity of this.activityBuffer) {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
    }
    
    return stats;
  }
  
  /**
   * Get agent-specific statistics
   */
  getAgentStats(agentId) {
    const agent = this.connectedAgents.get(agentId);
    if (!agent) return null;
    
    const activities = this.activityBuffer.filter(a => a.agentId === agentId);
    
    return {
      agent,
      recentActivities: activities.length,
      byType: activities.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// ==========================================
// Agent Communication Protocol
// ==========================================

const AgentProtocol = {
  // Messages from agent to server
  REGISTER: 'agent:register',
  HEARTBEAT: 'agent:heartbeat',
  ACTIVITY: 'agent:activity',
  
  // Messages from server to agent
  POLICY_UPDATE: 'server:policy_update',
  RESPONSE: 'server:response',
  COMMAND: 'server:command'
};

// ==========================================
// Agent Configuration Template
// ==========================================

const AgentConfigTemplate = {
  version: '1.0.0',
  serverUrl: 'wss://dlp.yourdomain.com/agent',
  heartbeatInterval: 30000, // 30 seconds
  
  monitoring: {
    usb: { enabled: true, scanContent: true },
    clipboard: { enabled: true, scanContent: true },
    print: { enabled: true, scanContent: true },
    screenCapture: { enabled: true, ocrEnabled: true },
    fileSystem: {
      enabled: true,
      watchPaths: ['Documents', 'Downloads', 'Desktop'],
      excludePatterns: ['*.tmp', '~*']
    }
  },
  
  blockingMode: true, // false = audit only
  userNotifications: true,
  
  policies: [] // Populated from server
};

module.exports = {
  EndpointAgentService: new EndpointAgentService(),
  AgentProtocol,
  AgentConfigTemplate
};
