/**
 * CryptoVault - Crypto Service
 * ML integration for cryptographic analysis
 */

const axios = require("axios");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8015";

class CryptoService {
  async analyzeKey(key) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/analyze/key`, {
        keyId: key._id.toString(),
        name: key.name,
        algorithm: key.algorithm,
        keyType: key.keyType,
        purpose: key.purpose,
        rotation: key.rotation,
        usage: key.usage,
      });

      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackKeyAnalysis(key);
    }
  }

  async validateCertificate(certificate) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/validate/certificate`,
        {
          certificateId: certificate._id.toString(),
          commonName: certificate.commonName,
          type: certificate.type,
          keyAlgorithm: certificate.keyAlgorithm,
          validity: certificate.validity,
          domains: certificate.domains,
          chain: certificate.chain,
        }
      );

      return response.data;
    } catch (error) {
      console.error("ML validation failed, using fallback:", error.message);
      return this.fallbackCertValidation(certificate);
    }
  }

  async analyzeSecret(secret) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/analyze/secret`, {
        secretId: secret._id.toString(),
        name: secret.name,
        type: secret.type,
        rotation: secret.rotation,
        usage: secret.usage,
        metadata: secret.metadata,
      });

      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackSecretAnalysis(secret);
    }
  }

  fallbackKeyAnalysis(key) {
    let riskScore = 0;
    const riskFactors = [];
    const recommendations = [];

    // Check algorithm strength
    const weakAlgorithms = ["AES-128", "RSA-2048"];
    if (weakAlgorithms.includes(key.algorithm)) {
      riskScore += 15;
      riskFactors.push({
        factor: "WEAK_ALGORITHM",
        severity: "medium",
        description: `${key.algorithm} may not meet current security standards`,
      });
      recommendations.push("Consider upgrading to stronger algorithm");
    }

    // Check rotation status
    if (!key.rotation.enabled) {
      riskScore += 25;
      riskFactors.push({
        factor: "ROTATION_DISABLED",
        severity: "high",
        description: "Automatic key rotation is disabled",
      });
      recommendations.push("Enable automatic key rotation");
    } else if (
      key.rotation.nextRotation &&
      new Date(key.rotation.nextRotation) < new Date()
    ) {
      riskScore += 20;
      riskFactors.push({
        factor: "ROTATION_OVERDUE",
        severity: "high",
        description: "Key rotation is overdue",
      });
      recommendations.push("Rotate key immediately");
    }

    // Check usage
    if (!key.usage.lastUsed) {
      riskScore += 10;
      riskFactors.push({
        factor: "UNUSED_KEY",
        severity: "low",
        description: "Key has never been used",
      });
    }

    return {
      keyId: key._id,
      riskScore: Math.min(100, riskScore),
      riskLevel: riskScore > 50 ? "high" : riskScore > 25 ? "medium" : "low",
      riskFactors,
      recommendations,
    };
  }

  fallbackCertValidation(certificate) {
    let riskScore = 0;
    const errors = [];
    const warnings = [];

    // Check expiration
    if (certificate.validity) {
      const daysRemaining = certificate.validity.daysRemaining || 0;

      if (daysRemaining <= 0) {
        riskScore += 50;
        errors.push("Certificate has expired");
      } else if (daysRemaining <= 7) {
        riskScore += 40;
        errors.push("Certificate expires within 7 days");
      } else if (daysRemaining <= 30) {
        riskScore += 20;
        warnings.push("Certificate expires within 30 days");
      }
    }

    // Check key algorithm
    if (certificate.keyAlgorithm === "RSA-2048") {
      warnings.push("Consider upgrading to RSA-4096 or ECDSA");
    }

    // Check chain
    if (!certificate.chain || certificate.chain.length === 0) {
      riskScore += 15;
      warnings.push("Certificate chain not provided");
    }

    return {
      certificateId: certificate._id,
      valid: errors.length === 0,
      riskScore: Math.min(100, riskScore),
      errors,
      warnings,
      recommendations: [
        ...errors.map(() => "Address certificate errors immediately"),
        ...warnings.map((w) => `Review: ${w}`),
      ],
    };
  }

  fallbackSecretAnalysis(secret) {
    let riskScore = 0;
    const riskFactors = [];
    const recommendations = [];

    // Check rotation
    if (!secret.rotation.enabled) {
      riskScore += 20;
      riskFactors.push({
        factor: "NO_ROTATION",
        severity: "medium",
        description: "Secret rotation is not enabled",
      });
      recommendations.push("Enable automatic secret rotation");
    }

    // Check age
    if (secret.rotation.lastRotated) {
      const daysSinceRotation =
        (new Date() - new Date(secret.rotation.lastRotated)) /
        (1000 * 60 * 60 * 24);
      if (daysSinceRotation > 90) {
        riskScore += 25;
        riskFactors.push({
          factor: "OLD_SECRET",
          severity: "high",
          description: `Secret not rotated in ${Math.floor(
            daysSinceRotation
          )} days`,
        });
        recommendations.push("Rotate secret immediately");
      }
    }

    // Check access policy
    if (
      !secret.accessPolicy ||
      !secret.accessPolicy.allowedPrincipals?.length
    ) {
      riskScore += 15;
      riskFactors.push({
        factor: "OPEN_ACCESS",
        severity: "medium",
        description: "No access restrictions configured",
      });
      recommendations.push("Configure access policies");
    }

    // Check high-risk secret types
    const highRiskTypes = ["database_credential", "api_key", "ssh_key"];
    if (highRiskTypes.includes(secret.type)) {
      riskScore += 10;
      riskFactors.push({
        factor: "HIGH_RISK_TYPE",
        severity: "info",
        description: `${secret.type} requires extra protection`,
      });
    }

    return {
      secretId: secret._id,
      riskScore: Math.min(100, riskScore),
      riskLevel: riskScore > 50 ? "high" : riskScore > 25 ? "medium" : "low",
      riskFactors,
      recommendations,
    };
  }
}

module.exports = new CryptoService();
