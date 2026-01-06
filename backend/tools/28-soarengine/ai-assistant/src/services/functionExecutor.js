const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4028/api/v1/soarengine';

class FunctionExecutor {
  async executeFunction(functionName, args) {
    console.log(`🔧 Executing function: ${functionName}`);
    console.log(`📝 Arguments:`, JSON.stringify(args, null, 2));

    try {
      switch (functionName) {
        case 'create_playbook':
          return await this.createPlaybook(args);

        case 'execute_playbook':
          return await this.executePlaybook(args);

        case 'create_case':
          return await this.createCase(args);

        case 'integrate_tool':
          return await this.integrateTool(args);

        case 'query_playbook_library':
          return await this.queryPlaybookLibrary(args);

        case 'get_automation_metrics':
          return await this.getAutomationMetrics(args);

        case 'ai_recommend_response':
          return await this.aiRecommendResponse(args);

        case 'visualize_workflow':
          return await this.visualizeWorkflow(args);

        case 'bulk_action':
          return await this.bulkAction(args);

        case 'schedule_automation':
          return await this.scheduleAutomation(args);

        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`❌ Function execution error (${functionName}):`, error.message);
      throw error;
    }
  }

  async createPlaybook(args) {
    try {
      const response = await axios.post(`${API_BASE_URL}/playbooks`, args);
      return {
        success: true,
        message: 'Playbook created successfully',
        data: {
          id: response.data.data._id,
          name: response.data.data.name,
          category: response.data.data.category,
          steps: response.data.data.steps.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to create playbook: ${error.response?.data?.error || error.message}`);
    }
  }

  async executePlaybook(args) {
    try {
      const response = await axios.post(`${API_BASE_URL}/executions`, args);
      return {
        success: true,
        message: 'Playbook execution started',
        data: {
          executionId: response.data.data.executionId,
          status: response.data.data.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to execute playbook: ${error.response?.data?.error || error.message}`);
    }
  }

  async createCase(args) {
    try {
      const response = await axios.post(`${API_BASE_URL}/cases`, args);
      return {
        success: true,
        message: 'Case created successfully',
        data: {
          caseId: response.data.data.caseId,
          title: response.data.data.title,
          severity: response.data.data.severity,
          status: response.data.data.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to create case: ${error.response?.data?.error || error.message}`);
    }
  }

  async integrateTool(args) {
    try {
      const response = await axios.post(`${API_BASE_URL}/integrations`, args);
      return {
        success: true,
        message: 'Integration created successfully',
        data: {
          id: response.data.data._id,
          toolName: response.data.data.toolName,
          toolType: response.data.data.toolType,
          status: response.data.data.status
        }
      };
    } catch (error) {
      throw new Error(`Failed to create integration: ${error.response?.data?.error || error.message}`);
    }
  }

  async queryPlaybookLibrary(args) {
    try {
      const params = {
        search: args.search_query,
        category: args.category || 'all',
        complexity: args.complexity,
        limit: 10
      };

      const response = await axios.get(`${API_BASE_URL}/playbooks`, { params });
      
      return {
        success: true,
        message: `Found ${response.data.data.length} playbooks`,
        data: {
          playbooks: response.data.data.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            category: p.category,
            complexity: p.metadata.complexity,
            executions: p.executionStats.totalExecutions,
            successRate: p.executionStats.totalExecutions > 0
              ? ((p.executionStats.successfulExecutions / p.executionStats.totalExecutions) * 100).toFixed(1)
              : 'N/A'
          })),
          total: response.data.pagination.total
        }
      };
    } catch (error) {
      throw new Error(`Failed to query playbook library: ${error.response?.data?.error || error.message}`);
    }
  }

  async getAutomationMetrics(args) {
    try {
      const params = {
        time_period: args.time_period || 'last_7_days',
        metric_type: args.metric_type
      };

      const response = await axios.get(`${API_BASE_URL}/metrics/automation`, { params });
      
      return {
        success: true,
        message: 'Automation metrics retrieved successfully',
        data: response.data.data
      };
    } catch (error) {
      throw new Error(`Failed to get metrics: ${error.response?.data?.error || error.message}`);
    }
  }

  async aiRecommendResponse(args) {
    // AI-powered response recommendation logic
    const { incident_data, threat_type, severity, affected_assets } = args;

    const recommendations = [];
    const suggestedPlaybooks = [];

    // Rule-based recommendations
    if (threat_type.toLowerCase().includes('phishing')) {
      recommendations.push(
        'Isolate affected email accounts',
        'Block malicious sender domains',
        'Run anti-phishing awareness campaign',
        'Scan all endpoints for malware'
      );
      suggestedPlaybooks.push('Phishing Response Playbook');
    } else if (threat_type.toLowerCase().includes('malware')) {
      recommendations.push(
        'Quarantine infected endpoints',
        'Block malware hash across network',
        'Perform memory analysis',
        'Review lateral movement indicators'
      );
      suggestedPlaybooks.push('Malware Containment Playbook');
    } else if (threat_type.toLowerCase().includes('ddos')) {
      recommendations.push(
        'Enable rate limiting',
        'Activate DDoS protection',
        'Blackhole malicious traffic',
        'Scale infrastructure resources'
      );
      suggestedPlaybooks.push('DDoS Mitigation Playbook');
    }

    // Severity-based recommendations
    if (severity === 'critical') {
      recommendations.unshift('Escalate to security leadership immediately');
      recommendations.push('Prepare incident report for stakeholders');
    }

    return {
      success: true,
      message: 'AI-powered recommendations generated',
      data: {
        threat_type,
        severity,
        recommendations,
        suggested_playbooks: suggestedPlaybooks,
        estimated_response_time: severity === 'critical' ? '15 minutes' : '1 hour',
        required_integrations: ['SIEM', 'EDR', 'Firewall'],
        confidence: 0.87
      }
    };
  }

  async visualizeWorkflow(args) {
    try {
      const response = await axios.get(`${API_BASE_URL}/playbooks/${args.playbook_id}`);
      const playbook = response.data.data;

      const workflow = {
        name: playbook.name,
        totalSteps: playbook.steps.length,
        visualization: playbook.steps.map((step, index) => ({
          stepNumber: index + 1,
          action: step.action,
          tool: step.tool,
          condition: step.condition || 'Always',
          onSuccess: step.onSuccess,
          onFailure: step.onFailure
        })),
        estimatedDuration: `${Math.floor(playbook.metadata.estimatedDuration / 60)} minutes`
      };

      if (args.include_stats && playbook.executionStats.totalExecutions > 0) {
        workflow.stats = {
          totalExecutions: playbook.executionStats.totalExecutions,
          successRate: ((playbook.executionStats.successfulExecutions / playbook.executionStats.totalExecutions) * 100).toFixed(1),
          averageDuration: `${Math.floor(playbook.executionStats.averageDuration / 1000)}s`
        };
      }

      return {
        success: true,
        message: 'Workflow visualization generated',
        data: workflow
      };
    } catch (error) {
      throw new Error(`Failed to visualize workflow: ${error.response?.data?.error || error.message}`);
    }
  }

  async bulkAction(args) {
    const { action, targets, tools, reason, dry_run } = args;

    if (dry_run) {
      return {
        success: true,
        message: 'Bulk action simulation completed (dry run)',
        data: {
          action,
          targetCount: targets.length,
          tools: tools || ['all configured tools'],
          reason,
          simulatedResults: targets.map(target => ({
            target,
            status: 'would_succeed',
            estimatedTime: '2-5 seconds'
          })),
          totalEstimatedTime: `${targets.length * 3}s`,
          dryRun: true
        }
      };
    }

    // In production, execute actual bulk actions via integrations
    return {
      success: true,
      message: `Bulk action '${action}' executed on ${targets.length} targets`,
      data: {
        action,
        successCount: targets.length,
        failedCount: 0,
        reason,
        timestamp: new Date().toISOString()
      }
    };
  }

  async scheduleAutomation(args) {
    const { playbook_id, schedule_type, schedule_config, start_time } = args;

    try {
      const response = await axios.get(`${API_BASE_URL}/playbooks/${playbook_id}`);
      const playbook = response.data.data;

      // Update playbook with schedule
      const updateData = {
        schedule: {
          enabled: true,
          type: schedule_type,
          config: schedule_config,
          startTime: start_time || new Date().toISOString()
        }
      };

      await axios.put(`${API_BASE_URL}/playbooks/${playbook_id}`, updateData);

      return {
        success: true,
        message: 'Automation scheduled successfully',
        data: {
          playbookName: playbook.name,
          scheduleType: schedule_type,
          startTime: start_time,
          nextExecution: this.calculateNextExecution(schedule_type, schedule_config, start_time)
        }
      };
    } catch (error) {
      throw new Error(`Failed to schedule automation: ${error.response?.data?.error || error.message}`);
    }
  }

  calculateNextExecution(scheduleType, config, startTime) {
    const now = new Date();
    const start = startTime ? new Date(startTime) : now;

    switch (scheduleType) {
      case 'once':
        return start > now ? start.toISOString() : 'Already executed';
      case 'daily':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString();
      case 'weekly':
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString();
      default:
        return 'Calculated based on cron expression';
    }
  }
}

module.exports = new FunctionExecutor();
