const axios = require("axios");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8018";

class ThreatModelService {
  // Analyze threat model
  async analyze(threatModel) {
    try {
      // Try ML engine first
      const response = await axios.post(
        `${ML_ENGINE_URL}/analyze/model`,
        {
          model: threatModel.toObject(),
        },
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      // Fallback to local analysis
      return this.localAnalysis(threatModel);
    }
  }

  // Local analysis fallback
  localAnalysis(threatModel) {
    const threats = threatModel.threats || [];
    const components = threatModel.components || [];

    return {
      summary: {
        totalThreats: threats.length,
        totalComponents: components.length,
        threatsByCategory: this.groupBy(threats, "category"),
        threatsByRisk: this.groupBy(threats, "riskLevel"),
      },
      riskScore: this.calculateOverallRisk(threats),
      recommendations: this.generateRecommendations(threatModel),
      coverage: this.assessCoverage(threatModel),
    };
  }

  // STRIDE analysis
  async analyzeSTRIDE(threatModel) {
    const components = threatModel.components || [];

    const strideCategories = {
      spoofing: [],
      tampering: [],
      repudiation: [],
      informationDisclosure: [],
      denialOfService: [],
      elevationOfPrivilege: [],
    };

    // Analyze each component for STRIDE threats
    for (const component of components) {
      const componentThreats = this.identifySTRIDEThreats(component);

      for (const [category, threats] of Object.entries(componentThreats)) {
        strideCategories[category].push(...threats);
      }
    }

    return strideCategories;
  }

  // Identify STRIDE threats for a component
  identifySTRIDEThreats(component) {
    const threats = {
      spoofing: [],
      tampering: [],
      repudiation: [],
      informationDisclosure: [],
      denialOfService: [],
      elevationOfPrivilege: [],
    };

    const componentName = component.name || "Unknown";
    const componentType = component.type || "other";

    // Spoofing
    if (["web_server", "api", "user"].includes(componentType)) {
      threats.spoofing.push({
        threat: `Identity spoofing for ${componentName}`,
        description: "Attacker may impersonate legitimate user or service",
        risk: component.trustLevel === "untrusted" ? "high" : "medium",
      });
    }

    // Tampering
    if (["database", "data_store", "api"].includes(componentType)) {
      threats.tampering.push({
        threat: `Data tampering in ${componentName}`,
        description: "Unauthorized modification of data or code",
        risk: "high",
      });
    }

    // Repudiation
    threats.repudiation.push({
      threat: `Non-repudiation for ${componentName}`,
      description: "Actions may not be properly logged or auditable",
      risk: "medium",
    });

    // Information Disclosure
    if (["database", "api", "external_service"].includes(componentType)) {
      threats.informationDisclosure.push({
        threat: `Information disclosure from ${componentName}`,
        description: "Sensitive data may be exposed",
        risk: component.dataHandled?.some((d) => d.pii || d.phi)
          ? "critical"
          : "high",
      });
    }

    // Denial of Service
    if (["web_server", "api", "load_balancer"].includes(componentType)) {
      threats.denialOfService.push({
        threat: `Denial of service for ${componentName}`,
        description: "Service availability may be disrupted",
        risk:
          component.riskProfile?.criticality === "critical"
            ? "critical"
            : "high",
      });
    }

    // Elevation of Privilege
    threats.elevationOfPrivilege.push({
      threat: `Privilege escalation via ${componentName}`,
      description: "Attacker may gain elevated permissions",
      risk: component.trustLevel === "highly_trusted" ? "critical" : "medium",
    });

    return threats;
  }

  // PASTA analysis
  async analyzePASTA(threatModel) {
    return {
      stage1_objectives: {
        businessObjectives: this.extractBusinessObjectives(threatModel),
        securityRequirements: this.extractSecurityRequirements(threatModel),
      },
      stage2_technicalScope: {
        assets: this.identifyAssets(threatModel),
        dependencies: this.identifyDependencies(threatModel),
      },
      stage3_decomposition: {
        components: (threatModel.components || []).map((c) => c.name),
        dataFlows: (threatModel.system?.dataFlows || []).map(
          (df) => `${df.source} -> ${df.destination} (${df.dataType})`
        ),
      },
      stage4_threatAnalysis: {
        threats: (threatModel.threats || []).map((t) => t.name),
        attackVectors: this.identifyAttackVectors(threatModel),
      },
      stage5_vulnerabilities: {
        weaknesses: this.identifyWeaknesses(threatModel),
        exposures: this.identifyExposures(threatModel),
      },
      stage6_attackModeling: {
        attackTrees: this.generateAttackTrees(threatModel),
        scenarios: this.generateScenarios(threatModel),
      },
      stage7_riskAnalysis: {
        risks: this.assessRisks(threatModel),
        recommendations: this.generateRecommendations(threatModel),
      },
    };
  }

  // Generate report
  async generateReport(threatModel, format) {
    const analysis = await this.analyze(threatModel);
    const stride = await this.analyzeSTRIDE(threatModel);

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        format,
        threatModelId: threatModel._id,
        threatModelName: threatModel.name,
      },
      executiveSummary: {
        overview: `Threat model for ${threatModel.name}`,
        totalThreats: (threatModel.threats || []).length,
        criticalThreats: (threatModel.threats || []).filter(
          (t) => t.riskLevel === "critical"
        ).length,
        mitigationStatus: this.calculateMitigationStatus(threatModel),
      },
      analysis,
      strideAnalysis: stride,
      recommendations: this.generateRecommendations(threatModel),
      nextSteps: this.generateNextSteps(threatModel),
    };
  }

  // Helper methods
  groupBy(items, key) {
    return items.reduce((acc, item) => {
      const value = item[key] || "unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  calculateOverallRisk(threats) {
    if (!threats.length) return 0;
    const scores = threats.map((t) => t.riskScore || 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  assessCoverage(threatModel) {
    const components = threatModel.components || [];
    const threats = threatModel.threats || [];

    const coveredComponents = new Set(
      threats.flatMap((t) =>
        (t.affectedComponents || []).map((c) => c.toString())
      )
    );

    return {
      componentsAnalyzed: components.length,
      componentsCovered: coveredComponents.size,
      coveragePercent: components.length
        ? Math.round((coveredComponents.size / components.length) * 100)
        : 0,
    };
  }

  extractBusinessObjectives(threatModel) {
    return (
      threatModel.pastaAnalysis?.stage1_objectives?.businessObjectives || [
        "Protect customer data",
        "Ensure service availability",
        "Maintain compliance",
      ]
    );
  }

  extractSecurityRequirements(threatModel) {
    return ["Authentication", "Authorization", "Encryption", "Audit logging"];
  }

  identifyAssets(threatModel) {
    const components = threatModel.components || [];
    return components.flatMap((c) =>
      (c.dataHandled || []).map((d) => `${d.type} (${d.classification})`)
    );
  }

  identifyDependencies(threatModel) {
    const components = threatModel.components || [];
    return components.flatMap((c) => (c.dependencies || []).map((d) => d.name));
  }

  identifyAttackVectors(threatModel) {
    return [
      "Network-based attacks",
      "Application-level attacks",
      "Social engineering",
    ];
  }

  identifyWeaknesses(threatModel) {
    return [
      "Input validation gaps",
      "Authentication weaknesses",
      "Encryption gaps",
    ];
  }

  identifyExposures(threatModel) {
    const components = threatModel.components || [];
    return components
      .filter((c) => c.riskProfile?.exposureLevel === "external")
      .map((c) => `${c.name} is externally exposed`);
  }

  generateAttackTrees(threatModel) {
    return ["Unauthorized access tree", "Data exfiltration tree"];
  }

  generateScenarios(threatModel) {
    return [
      "Attacker gains access through stolen credentials",
      "SQL injection leads to data breach",
      "DDoS attack disrupts service availability",
    ];
  }

  assessRisks(threatModel) {
    const threats = threatModel.threats || [];
    return threats
      .filter((t) => t.riskLevel === "critical" || t.riskLevel === "high")
      .map((t) => `${t.riskLevel.toUpperCase()}: ${t.name}`);
  }

  generateRecommendations(threatModel) {
    return [
      "Implement multi-factor authentication",
      "Enable encryption for data at rest and in transit",
      "Deploy web application firewall",
      "Implement comprehensive logging and monitoring",
      "Conduct regular security assessments",
    ];
  }

  calculateMitigationStatus(threatModel) {
    const threats = threatModel.threats || [];
    const mitigated = threats.filter((t) => t.status === "mitigated").length;
    return {
      total: threats.length,
      mitigated,
      percent: threats.length
        ? Math.round((mitigated / threats.length) * 100)
        : 0,
    };
  }

  generateNextSteps(threatModel) {
    return [
      "Review and prioritize identified threats",
      "Develop mitigation plans for critical threats",
      "Assign owners for each mitigation",
      "Schedule follow-up threat modeling session",
      "Update model after system changes",
    ];
  }
}

module.exports = new ThreatModelService();
