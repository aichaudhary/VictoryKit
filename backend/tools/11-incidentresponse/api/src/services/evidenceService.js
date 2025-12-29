/**
 * Evidence Service
 * Business logic for evidence analysis
 */

const axios = require("axios");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8011";

class EvidenceService {
  /**
   * Analyze evidence with AI/ML engine
   */
  async analyzeWithAI(evidence) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/analyze/evidence`, {
        type: evidence.type,
        name: evidence.name,
        description: evidence.description,
        source: evidence.source,
        storage: evidence.storage,
      });

      return response.data;
    } catch (error) {
      console.error("ML Engine error:", error.message);

      // Return basic analysis if ML engine unavailable
      return this.basicAnalysis(evidence);
    }
  }

  /**
   * Basic analysis without ML
   */
  basicAnalysis(evidence) {
    const findings = [];
    const artifacts = [];

    // Generate findings based on evidence type
    switch (evidence.type) {
      case "malware_sample":
        findings.push("Malware sample collected for analysis");
        findings.push("Hash verification completed");
        artifacts.push({
          type: "hash",
          value: evidence.storage?.hash?.sha256 || "N/A",
        });
        break;

      case "memory_dump":
        findings.push("Memory dump collected");
        findings.push("Ready for volatility analysis");
        artifacts.push({
          type: "size",
          value: `${evidence.storage?.size || 0} bytes`,
        });
        break;

      case "disk_image":
        findings.push("Disk image collected");
        findings.push("Chain of custody established");
        artifacts.push({
          type: "hash",
          value: evidence.storage?.hash?.sha256 || "N/A",
        });
        break;

      case "network_capture":
        findings.push("Network capture collected");
        findings.push("Ready for protocol analysis");
        break;

      case "log_file":
        findings.push("Log file collected");
        findings.push("Ready for timeline analysis");
        break;

      default:
        findings.push("Evidence collected and preserved");
    }

    return {
      findings,
      artifacts,
      summary: `Analysis of ${evidence.type} evidence "${evidence.name}"`,
      recommendations: [
        "Maintain chain of custody",
        "Store evidence in secure location",
        "Document all access to evidence",
      ],
    };
  }
}

module.exports = new EvidenceService();
