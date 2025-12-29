const axios = require("axios");

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
}

module.exports = new WAFService();
