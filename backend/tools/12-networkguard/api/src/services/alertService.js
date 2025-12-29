/**
 * Alert Analysis Service
 */

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8012";

class AlertService {
  async analyzeAlert(alert) {
    try {
      // Try ML engine first
      const response = await fetch(`${ML_ENGINE_URL}/analyze/alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alert),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("ML Engine unavailable, using fallback analysis");
    }

    // Fallback analysis
    return this.fallbackAnalysis(alert);
  }

  fallbackAnalysis(alert) {
    const severityScores = {
      critical: 100,
      high: 80,
      medium: 50,
      low: 25,
      info: 10,
    };
    const baseScore = severityScores[alert.severity] || 50;

    const threats = [];
    const recommendations = [];

    // Analyze based on category
    switch (alert.category) {
      case "intrusion":
        threats.push("Potential unauthorized access attempt");
        recommendations.push("Investigate source IP", "Review firewall rules");
        break;
      case "malware":
        threats.push("Malicious software detected");
        recommendations.push("Isolate affected host", "Run malware scan");
        break;
      case "anomaly":
        threats.push("Unusual network behavior detected");
        recommendations.push("Establish baseline", "Monitor for patterns");
        break;
      case "reconnaissance":
        threats.push("Network scanning activity");
        recommendations.push("Block source IP", "Review exposed services");
        break;
      case "exfiltration":
        threats.push("Possible data exfiltration");
        recommendations.push("Monitor data flows", "Check DLP policies");
        break;
      default:
        threats.push("Security event detected");
        recommendations.push("Review alert details", "Investigate further");
    }

    return {
      classification: alert.category,
      confidence: 0.75,
      riskScore: baseScore,
      threats,
      recommendations,
      iocMatches: [],
    };
  }
}

module.exports = new AlertService();
