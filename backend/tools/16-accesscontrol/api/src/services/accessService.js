/**
 * AccessControl - Access Service
 * Policy evaluation and ML integration
 */

const axios = require("axios");
const Policy = require("../models/Policy");
const Role = require("../models/Role");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8016";

class AccessService {
  async evaluateAccess({ subject, resource, action, context = {} }) {
    try {
      // Get applicable policies
      const policies = await Policy.find({
        isActive: true,
        $or: [
          { "subjects.users": subject.userId },
          { "subjects.roles": { $in: subject.roles || [] } },
          { "subjects.groups": { $in: subject.groups || [] } },
        ],
      }).sort({ priority: 1 });

      let decision = "deny";
      const matchedPolicies = [];

      for (const policy of policies) {
        // Check resource match
        const resourceMatch = this.matchResource(policy.resources, resource);
        if (!resourceMatch) continue;

        // Check action match
        const actionMatch =
          policy.actions.includes(action) || policy.actions.includes("*");
        if (!actionMatch) continue;

        // Check conditions
        const conditionsMatch = this.evaluateConditions(
          policy.conditions,
          context
        );
        if (!conditionsMatch) continue;

        // Check context restrictions
        const contextMatch = this.evaluateContext(policy.context, context);
        if (!contextMatch) continue;

        matchedPolicies.push({
          policyId: policy.policyId,
          name: policy.name,
          effect: policy.effect,
          priority: policy.priority,
        });

        // First matching policy wins (sorted by priority)
        if (policy.effect === "deny") {
          decision = "deny";
          break;
        } else if (policy.effect === "allow") {
          decision = "allow";
          break;
        }
      }

      return {
        decision,
        subject,
        resource,
        action,
        matchedPolicies,
        evaluatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  matchResource(resources, target) {
    if (
      !resources ||
      (!resources.types?.length &&
        !resources.identifiers?.length &&
        !resources.patterns?.length)
    ) {
      return true; // No restrictions
    }

    if (resources.types?.includes(target.type)) return true;
    if (resources.identifiers?.includes(target.id)) return true;

    for (const pattern of resources.patterns || []) {
      const regex = new RegExp(pattern.replace("*", ".*"));
      if (regex.test(target.path || target.id)) return true;
    }

    return false;
  }

  evaluateConditions(conditions, context) {
    if (!conditions || conditions.length === 0) return true;

    for (const condition of conditions) {
      const value = context[condition.attribute];

      switch (condition.operator) {
        case "equals":
          if (value !== condition.value) return false;
          break;
        case "not_equals":
          if (value === condition.value) return false;
          break;
        case "contains":
          if (!String(value).includes(condition.value)) return false;
          break;
        case "in":
          if (!condition.value.includes(value)) return false;
          break;
        case "not_in":
          if (condition.value.includes(value)) return false;
          break;
        default:
          break;
      }
    }

    return true;
  }

  evaluateContext(policyContext, requestContext) {
    if (!policyContext) return true;

    // Check time restrictions
    if (policyContext.timeRestrictions?.length) {
      const now = new Date();
      const currentDay = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][
        now.getDay()
      ];
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const timeAllowed = policyContext.timeRestrictions.some((tr) => {
        const dayMatch = !tr.days?.length || tr.days.includes(currentDay);
        const timeMatch =
          (!tr.startTime || currentTime >= tr.startTime) &&
          (!tr.endTime || currentTime <= tr.endTime);
        return dayMatch && timeMatch;
      });

      if (!timeAllowed) return false;
    }

    // Check IP restrictions
    if (policyContext.ipRestrictions?.length && requestContext.ip) {
      if (!policyContext.ipRestrictions.includes(requestContext.ip)) {
        return false;
      }
    }

    // Check MFA requirement
    if (policyContext.mfaRequired && !requestContext.mfaVerified) {
      return false;
    }

    return true;
  }

  async analyzePolicy(policyId) {
    try {
      const policy = await Policy.findOne({ policyId });
      if (!policy) throw new Error("Policy not found");

      const response = await axios.post(`${ML_ENGINE_URL}/analyze/policy`, {
        policy: policy.toObject(),
      });

      return response.data;
    } catch (error) {
      console.error("ML analysis failed, using fallback:", error.message);
      return this.fallbackAnalysis(policyId);
    }
  }

  async fallbackAnalysis(policyId) {
    const policy = await Policy.findOne({ policyId });
    const issues = [];
    const recommendations = [];

    // Check for overly permissive policies
    if (policy.actions.includes("*")) {
      issues.push({
        severity: "high",
        type: "OVERLY_PERMISSIVE",
        message: "Policy grants all actions (*)",
      });
      recommendations.push("Replace wildcard with specific actions");
    }

    // Check for missing conditions
    if (!policy.conditions?.length && policy.effect === "allow") {
      issues.push({
        severity: "medium",
        type: "NO_CONDITIONS",
        message: "Policy has no conditions",
      });
      recommendations.push("Add conditions to limit scope");
    }

    // Check for missing time restrictions
    if (
      !policy.context?.timeRestrictions?.length &&
      policy.effect === "allow"
    ) {
      recommendations.push("Consider adding time-based restrictions");
    }

    return {
      policyId,
      riskScore: issues.length * 25,
      issues,
      recommendations,
      analyzedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AccessService();
