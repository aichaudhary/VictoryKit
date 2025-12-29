/**
 * IdentityShield - Identity Service
 * ML integration for identity analysis
 */

const axios = require("axios");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8014";

class IdentityService {
  async analyzeIdentity(identity) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/analyze/identity`, {
        identityId: identity._id.toString(),
        type: identity.type,
        provider: identity.provider,
        roles:
          identity.roles?.map((r) => ({
            name: r.name,
            type: r.type,
          })) || [],
        permissions:
          identity.permissions?.map((p) => ({
            action: p.action,
            resource: p.resource,
            isPrivileged: p.isPrivileged,
          })) || [],
        authentication: identity.authentication || {},
      });

      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackAnalysis(identity);
    }
  }

  async analyzeRole(role) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/analyze/role`, {
        roleId: role._id.toString(),
        name: role.name,
        type: role.type,
        permissions:
          role.permissions?.map((p) => ({
            action: p.action,
            resource: p.resource,
            isPrivileged: p.isPrivileged,
          })) || [],
        trustPolicy: role.trustPolicy || {},
        assumableBy: role.assumableBy || [],
      });

      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackRoleAnalysis(role);
    }
  }

  async analyzePermissions(permissions) {
    try {
      const response = await axios.post(
        `${ML_ENGINE_URL}/analyze/permissions`,
        {
          permissions,
        }
      );

      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);

      let riskScore = 0;
      const findings = [];

      permissions.forEach((p) => {
        if (p.action === "*" || p.action?.includes(":*")) {
          riskScore += 25;
          findings.push({
            type: "WILDCARD_PERMISSION",
            severity: "high",
            permission: p.action,
          });
        }
        if (p.resource === "*") {
          riskScore += 15;
          findings.push({
            type: "WILDCARD_RESOURCE",
            severity: "medium",
            permission: p.action,
          });
        }
      });

      return {
        riskScore: Math.min(100, riskScore),
        riskLevel:
          riskScore > 70
            ? "critical"
            : riskScore > 50
            ? "high"
            : riskScore > 25
            ? "medium"
            : "low",
        findings,
        recommendations: [
          "Apply least privilege principle",
          "Use specific resource ARNs",
        ],
      };
    }
  }

  async evaluatePolicy(policy) {
    try {
      const response = await axios.post(`${ML_ENGINE_URL}/evaluate/policy`, {
        policyId: policy._id.toString(),
        name: policy.name,
        type: policy.type,
        document: policy.document,
      });

      return response.data;
    } catch (error) {
      console.error("ML evaluation failed, using fallback:", error.message);
      return this.fallbackPolicyEvaluation(policy);
    }
  }

  async getEffectivePermissions(identity) {
    const permissions = new Set();

    // Direct permissions
    identity.permissions?.forEach((p) => {
      permissions.add(
        JSON.stringify({
          action: p.action,
          resource: p.resource,
          source: "direct",
        })
      );
    });

    // Role-based permissions
    identity.roles?.forEach((role) => {
      role.permissions?.forEach((p) => {
        permissions.add(
          JSON.stringify({
            action: p.action,
            resource: p.resource,
            source: `role:${role.name}`,
          })
        );
      });
    });

    return {
      identityId: identity._id,
      effectivePermissions: Array.from(permissions).map((p) => JSON.parse(p)),
      totalCount: permissions.size,
    };
  }

  fallbackAnalysis(identity) {
    let riskScore = 0;
    const riskFactors = [];

    // Check MFA
    if (!identity.authentication?.mfaEnabled) {
      riskScore += 20;
      riskFactors.push({
        factor: "NO_MFA",
        severity: "high",
        description: "Multi-factor authentication is not enabled",
      });
    }

    // Check access keys
    if (identity.authentication?.accessKeys?.length > 1) {
      riskScore += 10;
      riskFactors.push({
        factor: "MULTIPLE_ACCESS_KEYS",
        severity: "medium",
        description: "Multiple access keys present",
      });
    }

    // Check privileged permissions
    const privilegedCount =
      identity.permissions?.filter((p) => p.isPrivileged)?.length || 0;
    if (privilegedCount > 0) {
      riskScore += privilegedCount * 10;
      riskFactors.push({
        factor: "PRIVILEGED_ACCESS",
        severity: "high",
        description: `${privilegedCount} privileged permissions assigned`,
      });
    }

    riskScore = Math.min(100, riskScore);

    return {
      riskScore,
      riskLevel:
        riskScore > 70
          ? "critical"
          : riskScore > 50
          ? "high"
          : riskScore > 25
          ? "medium"
          : "low",
      riskFactors,
      recommendations: [
        !identity.authentication?.mfaEnabled
          ? "Enable MFA for this identity"
          : null,
        privilegedCount > 0 ? "Review and minimize privileged access" : null,
      ].filter(Boolean),
    };
  }

  fallbackRoleAnalysis(role) {
    let riskScore = 0;
    const riskFactors = [];

    // Check trust policy
    if (role.trustPolicy?.Statement) {
      const hasWildcard = role.trustPolicy.Statement.some(
        (s) => s.Principal === "*" || s.Principal?.AWS === "*"
      );
      if (hasWildcard) {
        riskScore += 40;
        riskFactors.push({
          factor: "WILDCARD_TRUST",
          severity: "critical",
          description: "Role can be assumed by anyone",
        });
      }
    }

    // Check permissions
    const privilegedPerms =
      role.permissions?.filter((p) => p.isPrivileged)?.length || 0;
    if (privilegedPerms > 0) {
      riskScore += privilegedPerms * 10;
      riskFactors.push({
        factor: "PRIVILEGED_PERMISSIONS",
        severity: "high",
        description: `Role has ${privilegedPerms} privileged permissions`,
      });
    }

    riskScore = Math.min(100, riskScore);

    return {
      riskScore,
      riskLevel:
        riskScore > 70
          ? "critical"
          : riskScore > 50
          ? "high"
          : riskScore > 25
          ? "medium"
          : "low",
      riskFactors,
      recommendations: ["Review trust relationships", "Apply least privilege"],
    };
  }

  fallbackPolicyEvaluation(policy) {
    let riskScore = 0;
    const findings = [];

    if (policy.document?.statements) {
      policy.document.statements.forEach((stmt, idx) => {
        // Check for wildcards
        if (stmt.actions?.includes("*")) {
          riskScore += 30;
          findings.push({
            type: "WILDCARD_ACTION",
            severity: "critical",
            description: `Statement ${idx + 1} allows all actions`,
          });
        }

        if (stmt.resources?.includes("*")) {
          riskScore += 20;
          findings.push({
            type: "WILDCARD_RESOURCE",
            severity: "high",
            description: `Statement ${idx + 1} applies to all resources`,
          });
        }

        // Check for missing conditions
        if (stmt.effect === "Allow" && !stmt.conditions) {
          findings.push({
            type: "NO_CONDITIONS",
            severity: "low",
            description: `Statement ${idx + 1} has no conditions`,
          });
        }
      });
    }

    riskScore = Math.min(100, riskScore);

    return {
      riskScore,
      riskLevel:
        riskScore > 70
          ? "critical"
          : riskScore > 50
          ? "high"
          : riskScore > 25
          ? "medium"
          : "low",
      findings,
      recommendations: [
        "Use specific actions instead of wildcards",
        "Scope resources appropriately",
        "Add condition keys for additional security",
      ],
    };
  }
}

module.exports = new IdentityService();
