const axios = require("axios");
const { getConnectors } = require("../../../../shared/connectors");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8021";

class WAFService {
  // Sync with WAF provider
  async syncWithProvider(instance) {
    // In production, this would call the actual provider APIs
    // For now, simulate the sync
    console.log(
      `Syncing WAF instance ${instance.name} with ${instance.provider}`
    );

    return {
      success: true,
      provider: instance.provider,
      statistics: {
        totalRequests: Math.floor(Math.random() * 100000),
        blockedRequests: Math.floor(Math.random() * 5000),
        allowedRequests: Math.floor(Math.random() * 95000),
        lastUpdated: new Date(),
      },
      rules: {
        synced: Math.floor(Math.random() * 50),
        errors: 0,
      },
    };
  }

  // Deploy rule to provider
  async deployRule(rule) {
    console.log(`Deploying rule ${rule.ruleId} to WAF`);

    // In production, call provider API
    return {
      success: true,
      ruleId: rule.ruleId,
      deployedAt: new Date(),
      provider: rule.instanceId?.provider || "unknown",
    };
  }

  // Apply policy to instance
  async applyPolicy(instance, policy) {
    console.log(`Applying policy ${policy.policyId} to ${instance.name}`);

    return {
      success: true,
      rulesDeployed: policy.rules.length,
      configuration: {
        defaultAction: policy.defaultAction,
        loggingEnabled: policy.logging.enabled,
      },
    };
  }

  // Optimize rules using ML
  async optimizeRules(rules) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/optimize`,
        {
          rules: rules.map((r) => ({
            id: r.ruleId,
            name: r.name,
            type: r.type,
            category: r.category,
            conditions: r.conditions,
            statistics: r.statistics,
          })),
        },
        { timeout: 30000 }
      );

      return response.data;
    } catch (error) {
      // Fallback to local analysis
      return this.localOptimization(rules);
    }
  }

  // Local rule optimization
  localOptimization(rules) {
    const recommendations = [];
    const redundantRules = [];
    const falsePositiveRisks = [];

    // Find rules with high hit but low block rates
    for (const rule of rules) {
      const hitRate = rule.statistics?.hits || 0;
      const blockRate = rule.statistics?.blocks || 0;

      if (hitRate > 100 && blockRate / hitRate < 0.1) {
        falsePositiveRisks.push({
          ruleId: rule.ruleId,
          ruleName: rule.name,
          hits: hitRate,
          blocks: blockRate,
          falsePositiveRate: 1 - blockRate / hitRate,
          recommendation: "Review rule for false positives",
        });
      }
    }

    // Find potential redundant rules
    const rulesByCategory = {};
    for (const rule of rules) {
      const cat = rule.category;
      if (!rulesByCategory[cat]) rulesByCategory[cat] = [];
      rulesByCategory[cat].push(rule);
    }

    for (const [category, catRules] of Object.entries(rulesByCategory)) {
      if (catRules.length > 5) {
        recommendations.push({
          category,
          ruleCount: catRules.length,
          suggestion: `Consider consolidating ${category} rules - ${catRules.length} rules may cause performance impact`,
        });
      }
    }

    // Check for disabled rules
    const disabledRules = rules.filter((r) => !r.enabled);
    if (disabledRules.length > 10) {
      recommendations.push({
        type: "cleanup",
        suggestion: `${disabledRules.length} disabled rules - consider removing unused rules`,
      });
    }

    return {
      recommendations,
      falsePositiveRisks,
      redundantRules,
      suggestedMerges: [],
      performanceImpact: {
        currentRules: rules.length,
        estimatedLatency: rules.length * 0.5 + "ms",
      },
    };
  }

  // Integrate with external security stack
  async integrateWithSecurityStack(entityId, data) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log WAF events and rule deployments
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'WAF_Events_CL',
            data: {
              EntityId: entityId,
              EventType: data.eventType || 'rule_deployment',
              InstanceName: data.instanceName,
              Provider: data.provider,
              RulesDeployed: data.rulesDeployed || 0,
              BlockedRequests: data.blockedRequests || 0,
              FalsePositives: data.falsePositives || 0,
              Timestamp: new Date().toISOString(),
              Severity: data.severity || 'medium'
            }
          }).catch(err => console.error('Sentinel WAF integration failed:', err))
        );
      }

      // Cortex XSOAR - Create incidents for WAF attacks or misconfigurations
      if (connectors.xsoar && (data.attackDetected || data.misconfiguration)) {
        integrationPromises.push(
          connectors.xsoar.createIncident({
            type: data.attackDetected ? 'waf_attack' : 'waf_misconfiguration',
            severity: data.severity || 'medium',
            title: data.attackDetected ? 
              `WAF Attack Detected: ${data.attackType || 'Unknown'} on ${data.instanceName}` :
              `WAF Misconfiguration: ${data.instanceName}`,
            description: data.description || 'WAF security event requiring investigation',
            labels: {
              entityId,
              instanceName: data.instanceName,
              provider: data.provider,
              attackType: data.attackType,
              blockedRequests: data.blockedRequests
            }
          }).catch(err => console.error('XSOAR WAF integration failed:', err))
        );
      }

      // CrowdStrike - Update Falcon firewall rules if applicable
      if (connectors.crowdstrike && data.ruleDeployment) {
        integrationPromises.push(
          connectors.crowdstrike.updateFirewallRules({
            entityId,
            rules: data.deployedRules || [],
            instanceName: data.instanceName
          }).catch(err => console.error('CrowdStrike WAF integration failed:', err))
        );
      }

      // Cloudflare - Sync with Cloudflare WAF if using Cloudflare
      if (connectors.cloudflare && data.provider === 'cloudflare') {
        integrationPromises.push(
          connectors.cloudflare.updateWAF({
            zoneId: data.zoneId,
            rules: data.deployedRules || [],
            action: data.action || 'block'
          }).catch(err => console.error('Cloudflare WAF integration failed:', err))
        );
      }

      // Kong - Update rate limiting rules if API gateway involved
      if (connectors.kong && data.apiProtection) {
        integrationPromises.push(
          connectors.kong.updateRateLimit({
            serviceId: data.serviceId,
            routes: data.protectedRoutes || [],
            limits: data.rateLimits || {}
          }).catch(err => console.error('Kong WAF integration failed:', err))
        );
      }

      // Okta - Log security events for user context
      if (connectors.okta && data.userId) {
        integrationPromises.push(
          connectors.okta.logSecurityEvent({
            userId: data.userId,
            eventType: 'waf_interaction',
            details: {
              entityId,
              instanceName: data.instanceName,
              action: data.action || 'block',
              severity: data.severity
            }
          }).catch(err => console.error('Okta WAF integration failed:', err))
        );
      }

      // OpenCTI - Enrich threat intelligence with WAF data
      if (connectors.opencti && data.attackDetected) {
        integrationPromises.push(
          connectors.opencti.createIndicator({
            type: 'waf_attack_pattern',
            value: data.attackSignature || data.attackType,
            description: `WAF detected attack pattern: ${data.attackType}`,
            labels: ['waf', 'attack', data.provider],
            confidence: data.confidence || 80,
            entityId
          }).catch(err => console.error('OpenCTI WAF integration failed:', err))
        );
      }

      // Execute all integrations in parallel
      await Promise.allSettled(integrationPromises);
      console.log(`WAF integration completed for entity ${entityId}`);

    } catch (error) {
      console.error('WAF security stack integration error:', error);
      // Don't throw - integration failures shouldn't break core functionality
    }
  }
}

module.exports = new WAFService();
