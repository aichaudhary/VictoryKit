/**
 * Traffic Analysis Service
 */

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8012";

class TrafficService {
  async analyzeFlow(flowData) {
    try {
      const response = await fetch(`${ML_ENGINE_URL}/analyze/flow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flowData),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log("ML Engine unavailable, using fallback analysis");
    }

    return this.fallbackAnalysis(flowData);
  }

  fallbackAnalysis(flowData) {
    let anomalyScore = 0;
    const indicators = [];

    // Check for suspicious ports
    const suspiciousPorts = [4444, 5555, 6666, 31337, 12345, 23, 445, 3389];
    if (suspiciousPorts.includes(flowData.destinationPort)) {
      anomalyScore += 30;
      indicators.push({
        type: "suspicious_port",
        value: flowData.destinationPort.toString(),
        severity: "high",
      });
    }

    // Check for large data transfers
    if (flowData.bytes > 100000000) {
      // 100MB
      anomalyScore += 20;
      indicators.push({
        type: "large_transfer",
        value: `${Math.round(flowData.bytes / 1000000)}MB`,
        severity: "medium",
      });
    }

    // Check for unusual protocols on standard ports
    const portProtocolMismatch = {
      80: ["HTTP"],
      443: ["HTTPS", "TLS"],
      22: ["SSH"],
      53: ["DNS"],
    };

    if (
      portProtocolMismatch[flowData.destinationPort] &&
      !portProtocolMismatch[flowData.destinationPort].includes(
        flowData.protocol
      )
    ) {
      anomalyScore += 25;
      indicators.push({
        type: "protocol_mismatch",
        value: `${flowData.protocol} on port ${flowData.destinationPort}`,
        severity: "medium",
      });
    }

    return {
      isAnomaly: anomalyScore >= 30,
      anomalyScore,
      anomalyType: anomalyScore >= 30 ? "behavioral" : null,
      threatIndicators: indicators,
      classification: anomalyScore >= 50 ? "suspicious" : "normal",
      bandwidth: {
        bytesPerSecond: flowData.duration
          ? flowData.bytes / flowData.duration
          : 0,
        packetsPerSecond: flowData.duration
          ? flowData.packets / flowData.duration
          : 0,
      },
    };
  }
}

module.exports = new TrafficService();
