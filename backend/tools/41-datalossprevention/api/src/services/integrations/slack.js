/**
 * Slack DLP Integration
 * Real-time monitoring and scanning of Slack messages and files
 */

const { WebClient } = require('@slack/web-api');
const { App } = require('@slack/bolt');

class SlackIntegration {
  constructor() {
    this.client = null;
    this.app = null;
    this.isInitialized = false;
  }
  
  /**
   * Initialize Slack client
   */
  initialize() {
    if (this.isInitialized) return;
    
    if (!process.env.SLACK_BOT_TOKEN) {
      console.warn('Slack integration not configured - SLACK_BOT_TOKEN missing');
      return;
    }
    
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
    
    // Initialize Bolt app for real-time events
    if (process.env.SLACK_SIGNING_SECRET && process.env.SLACK_APP_TOKEN) {
      this.app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET,
        socketMode: true,
        appToken: process.env.SLACK_APP_TOKEN
      });
    }
    
    this.isInitialized = true;
  }
  
  // ==========================================
  // Channel & Message Operations
  // ==========================================
  
  /**
   * List all public channels
   */
  async listChannels() {
    this.initialize();
    
    const channels = [];
    let cursor;
    
    do {
      const response = await this.client.conversations.list({
        types: 'public_channel,private_channel',
        limit: 200,
        cursor
      });
      
      channels.push(...response.channels);
      cursor = response.response_metadata?.next_cursor;
    } while (cursor);
    
    return channels;
  }
  
  /**
   * Get channel history (messages)
   */
  async getChannelHistory(channelId, options = {}) {
    this.initialize();
    
    const { oldest, latest, limit = 100 } = options;
    
    const params = {
      channel: channelId,
      limit
    };
    
    if (oldest) params.oldest = oldest;
    if (latest) params.latest = latest;
    
    const response = await this.client.conversations.history(params);
    return response.messages;
  }
  
  /**
   * Get thread replies
   */
  async getThreadReplies(channelId, threadTs) {
    this.initialize();
    
    const response = await this.client.conversations.replies({
      channel: channelId,
      ts: threadTs
    });
    
    return response.messages;
  }
  
  // ==========================================
  // DLP Scanning
  // ==========================================
  
  /**
   * Scan channel messages for sensitive data
   */
  async scanChannel(channelId, dlpService, options = {}) {
    this.initialize();
    
    const { daysBack = 7, includeThreads = true } = options;
    const oldest = Math.floor((Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000).toString();
    
    const results = {
      channelId,
      messagesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      // Get channel info
      const channelInfo = await this.client.conversations.info({ channel: channelId });
      results.channelName = channelInfo.channel.name;
      
      // Get messages
      const messages = await this.getChannelHistory(channelId, { oldest, limit: 1000 });
      
      for (const message of messages) {
        results.messagesScanned++;
        
        // Scan message text
        if (message.text) {
          const scanResult = await dlpService.scanContent(message.text);
          
          if (scanResult.totalFindings > 0) {
            const violation = {
              messageTs: message.ts,
              userId: message.user,
              text: this.redactMessage(message.text),
              permalink: await this.getPermalink(channelId, message.ts),
              ...scanResult
            };
            
            // Get user info
            try {
              const userInfo = await this.client.users.info({ user: message.user });
              violation.userName = userInfo.user.real_name;
              violation.userEmail = userInfo.user.profile.email;
            } catch {}
            
            results.violations.push(violation);
          }
        }
        
        // Scan files attached to message
        if (message.files?.length > 0) {
          for (const file of message.files) {
            const fileResult = await this.scanFile(file, dlpService);
            if (fileResult.findings?.length > 0) {
              results.violations.push({
                messageTs: message.ts,
                userId: message.user,
                type: 'file',
                fileName: file.name,
                ...fileResult
              });
            }
          }
        }
        
        // Scan thread replies
        if (includeThreads && message.reply_count > 0) {
          const replies = await this.getThreadReplies(channelId, message.ts);
          for (const reply of replies.slice(1)) { // Skip parent message
            results.messagesScanned++;
            
            if (reply.text) {
              const replyScan = await dlpService.scanContent(reply.text);
              if (replyScan.totalFindings > 0) {
                results.violations.push({
                  messageTs: reply.ts,
                  parentTs: message.ts,
                  userId: reply.user,
                  isThreadReply: true,
                  ...replyScan
                });
              }
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Slack channel scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  /**
   * Scan all workspace channels
   */
  async scanWorkspace(dlpService, options = {}) {
    this.initialize();
    
    const results = {
      channelsScanned: 0,
      totalMessages: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      const channels = await this.listChannels();
      
      for (const channel of channels) {
        try {
          const channelResult = await this.scanChannel(channel.id, dlpService, options);
          results.channelsScanned++;
          results.totalMessages += channelResult.messagesScanned;
          results.violations.push(...channelResult.violations.map(v => ({
            ...v,
            channelId: channel.id,
            channelName: channel.name
          })));
        } catch (channelError) {
          console.error(`Error scanning channel ${channel.name}:`, channelError.message);
        }
      }
    } catch (error) {
      throw new Error(`Workspace scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  /**
   * Scan a Slack file
   */
  async scanFile(file, dlpService) {
    this.initialize();
    
    const results = {
      fileId: file.id,
      fileName: file.name,
      fileType: file.filetype,
      findings: []
    };
    
    // Check if file type is scannable
    const scannableTypes = ['text', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'json'];
    if (!scannableTypes.some(t => file.filetype?.includes(t))) {
      return results;
    }
    
    try {
      // Download file content
      const response = await this.client.files.info({ file: file.id });
      const fileInfo = response.file;
      
      if (fileInfo.url_private_download) {
        const axios = require('axios');
        const downloadResponse = await axios.get(fileInfo.url_private_download, {
          headers: {
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
          },
          responseType: 'arraybuffer'
        });
        
        const scanResult = await dlpService.scanFile(
          Buffer.from(downloadResponse.data),
          file.name,
          file.mimetype
        );
        
        results.findings = scanResult.findings;
        results.riskScore = scanResult.riskScore;
      }
    } catch (error) {
      console.error(`Error scanning Slack file: ${error.message}`);
    }
    
    return results;
  }
  
  // ==========================================
  // Real-time Monitoring
  // ==========================================
  
  /**
   * Start real-time message monitoring
   */
  async startRealTimeMonitoring(dlpService, onViolation) {
    if (!this.app) {
      throw new Error('Slack Bolt app not configured for real-time monitoring');
    }
    
    // Listen for new messages
    this.app.message(async ({ message, say }) => {
      if (message.text) {
        const scanResult = await dlpService.scanContent(message.text);
        
        if (scanResult.totalFindings > 0) {
          const violation = {
            channelId: message.channel,
            messageTs: message.ts,
            userId: message.user,
            riskScore: scanResult.riskScore,
            findings: scanResult.findings
          };
          
          // Callback for violation handling
          if (onViolation) {
            await onViolation(violation);
          }
          
          // Optionally notify user or delete message based on severity
          if (scanResult.riskScore >= 90) {
            await this.handleCriticalViolation(message, scanResult);
          }
        }
      }
    });
    
    // Listen for file uploads
    this.app.event('file_shared', async ({ event }) => {
      const fileInfo = await this.client.files.info({ file: event.file_id });
      const scanResult = await this.scanFile(fileInfo.file, dlpService);
      
      if (scanResult.riskScore >= 70) {
        if (onViolation) {
          await onViolation({
            type: 'file',
            fileId: event.file_id,
            channelId: event.channel_id,
            ...scanResult
          });
        }
      }
    });
    
    await this.app.start();
    console.log('Slack real-time DLP monitoring started');
  }
  
  /**
   * Handle critical violations (auto-remediation)
   */
  async handleCriticalViolation(message, scanResult) {
    try {
      // Delete message if auto-remediation is enabled
      if (process.env.ENABLE_AUTO_REMEDIATION === 'true') {
        await this.client.chat.delete({
          channel: message.channel,
          ts: message.ts
        });
        
        // Notify user via DM
        await this.notifyUser(message.user, {
          type: 'message_deleted',
          reason: 'Sensitive data detected',
          dataTypes: scanResult.findings.map(f => f.type)
        });
      } else {
        // Just notify admins
        await this.notifyAdmins(message, scanResult);
      }
    } catch (error) {
      console.error('Error handling critical violation:', error.message);
    }
  }
  
  // ==========================================
  // Notification & Remediation
  // ==========================================
  
  /**
   * Get message permalink
   */
  async getPermalink(channelId, messageTs) {
    try {
      const response = await this.client.chat.getPermalink({
        channel: channelId,
        message_ts: messageTs
      });
      return response.permalink;
    } catch {
      return null;
    }
  }
  
  /**
   * Send DM to user
   */
  async notifyUser(userId, notification) {
    this.initialize();
    
    try {
      // Open DM channel
      const dm = await this.client.conversations.open({ users: userId });
      
      // Send notification
      await this.client.chat.postMessage({
        channel: dm.channel.id,
        text: `⚠️ DLP Alert: ${notification.reason}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*⚠️ Data Loss Prevention Alert*\n\n${notification.reason}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Detected Data Types:*\n${notification.dataTypes?.join(', ') || 'N/A'}`
            }
          }
        ]
      });
    } catch (error) {
      console.error('Error notifying user:', error.message);
    }
  }
  
  /**
   * Notify security admins
   */
  async notifyAdmins(message, scanResult) {
    const adminChannel = process.env.SLACK_CHANNEL || '#security-alerts';
    
    try {
      const permalink = await this.getPermalink(message.channel, message.ts);
      
      await this.client.chat.postMessage({
        channel: adminChannel,
        text: '🚨 DLP Violation Detected',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 DLP Violation Detected'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*User:*\n<@${message.user}>`
              },
              {
                type: 'mrkdwn',
                text: `*Risk Score:*\n${scanResult.riskScore}/100`
              },
              {
                type: 'mrkdwn',
                text: `*Data Types:*\n${scanResult.findings.map(f => f.type).join(', ')}`
              },
              {
                type: 'mrkdwn',
                text: `*Message:*\n${permalink ? `<${permalink}|View Message>` : 'N/A'}`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Delete Message' },
                style: 'danger',
                value: JSON.stringify({ channel: message.channel, ts: message.ts }),
                action_id: 'delete_message'
              },
              {
                type: 'button',
                text: { type: 'plain_text', text: 'Dismiss' },
                value: 'dismiss',
                action_id: 'dismiss_alert'
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error('Error notifying admins:', error.message);
    }
  }
  
  /**
   * Delete a message (remediation)
   */
  async deleteMessage(channelId, messageTs) {
    this.initialize();
    
    await this.client.chat.delete({
      channel: channelId,
      ts: messageTs
    });
    
    return { success: true };
  }
  
  /**
   * Delete a file (remediation)
   */
  async deleteFile(fileId) {
    this.initialize();
    
    await this.client.files.delete({ file: fileId });
    
    return { success: true };
  }
  
  // ==========================================
  // Utility Methods
  // ==========================================
  
  redactMessage(text) {
    // Redact potentially sensitive data for logging
    return text
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN-REDACTED]')
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[CC-REDACTED]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]');
  }
}

module.exports = new SlackIntegration();
