/**
 * Finding Analysis Service
 */

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8013";

class FindingService {
  async analyzeFinding(finding) {
    try {
      const response = await fetch(`${ML_ENGINE_URL}/analyze/finding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finding),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("ML Engine unavailable, using fallback");
    }

    return this.fallbackAnalysis(finding);
  }

  fallbackAnalysis(finding) {
    const severityScores = {
      critical: 95,
      high: 75,
      medium: 50,
      low: 25,
      info: 10,
    };

    const riskScore = severityScores[finding.severity] || 50;

    const recommendations = [];

    switch (finding.category) {
      case "public_exposure":
        recommendations.push(
          "Remove public access",
          "Implement VPC endpoints",
          "Add WAF protection"
        );
        break;
      case "encryption":
        recommendations.push(
          "Enable encryption at rest",
          "Use customer-managed keys",
          "Enable encryption in transit"
        );
        break;
      case "access_control":
        recommendations.push(
          "Apply least privilege",
          "Review IAM policies",
          "Enable MFA"
        );
        break;
      case "logging":
        recommendations.push(
          "Enable CloudTrail/Activity logging",
          "Configure log retention",
          "Set up alerts"
        );
        break;
      default:
        recommendations.push(
          "Review configuration",
          "Apply security best practices"
        );
    }

    return {
      riskScore,
      exploitability:
        riskScore > 70 ? "High" : riskScore > 40 ? "Medium" : "Low",
      impact:
        finding.severity === "critical"
          ? "Severe"
          : finding.severity === "high"
          ? "Significant"
          : "Moderate",
      recommendations,
    };
  }
}

module.exports = new FindingService();
