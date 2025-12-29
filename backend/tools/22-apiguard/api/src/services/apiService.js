const axios = require("axios");

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8022";

class APIService {
  // Discover endpoints from OpenAPI/Swagger spec
  async discoverEndpoints(api, specUrl, specContent) {
    let spec = specContent;

    if (specUrl && !spec) {
      try {
        const response = await axios.get(specUrl);
        spec = response.data;
      } catch (error) {
        console.error("Failed to fetch specification:", error.message);
        return [];
      }
    }

    if (!spec) return [];

    const endpoints = [];
    const paths = spec.paths || {};

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, details] of Object.entries(methods)) {
        if (
          ["get", "post", "put", "patch", "delete", "head", "options"].includes(
            method.toLowerCase()
          )
        ) {
          const endpoint = {
            path,
            method: method.toUpperCase(),
            description: details.summary || details.description,
            parameters: this.parseParameters(details.parameters || []),
            requestBody: this.parseRequestBody(details.requestBody),
            responses: this.parseResponses(details.responses || {}),
            security: {
              authentication: !!details.security?.length,
              authorization:
                details.security?.flatMap((s) => Object.keys(s)) || [],
              scopes:
                details.security?.flatMap((s) => Object.values(s).flat()) || [],
            },
          };
          endpoints.push(endpoint);
        }
      }
    }

    return endpoints;
  }

  parseParameters(params) {
    return params.map((p) => ({
      name: p.name,
      location: p.in,
      type: p.schema?.type || p.type,
      required: p.required || false,
      validation: p.schema,
    }));
  }

  parseRequestBody(body) {
    if (!body) return null;
    const content = body.content || {};
    const contentType = Object.keys(content)[0] || "application/json";
    return {
      contentType,
      schema: content[contentType]?.schema,
      required: body.required || false,
    };
  }

  parseResponses(responses) {
    return Object.entries(responses).map(([code, details]) => ({
      statusCode: parseInt(code),
      description: details.description,
      schema: details.content?.["application/json"]?.schema,
    }));
  }

  // Calculate security score for API
  async calculateSecurityScore(api) {
    let score = 100;
    const issues = [];

    // Check authentication
    if (!api.authentication?.type || api.authentication.type === "none") {
      score -= 25;
      issues.push({
        severity: "critical",
        category: "authentication",
        description: "API has no authentication configured",
      });
    }

    // Check rate limiting
    if (!api.rateLimit?.enabled) {
      score -= 15;
      issues.push({
        severity: "high",
        category: "rate_limiting",
        description: "Rate limiting is not enabled",
      });
    }

    // Check endpoints for vulnerabilities
    for (const endpoint of api.endpoints || []) {
      for (const vuln of endpoint.vulnerabilities || []) {
        const deduction =
          {
            critical: 20,
            high: 15,
            medium: 10,
            low: 5,
            info: 2,
          }[vuln.severity] || 5;
        score -= deduction;
        issues.push(vuln);
      }
    }

    // Check specification
    if (!api.specification?.format) {
      score -= 10;
      issues.push({
        severity: "medium",
        category: "documentation",
        description: "API specification not provided",
      });
    }

    score = Math.max(0, Math.min(100, score));

    const grade =
      score >= 90
        ? "A+"
        : score >= 80
        ? "A"
        : score >= 70
        ? "B"
        : score >= 60
        ? "C"
        : score >= 50
        ? "D"
        : "F";

    return {
      score,
      grade,
      issues,
      lastScan: new Date(),
    };
  }

  // Scan endpoint for vulnerabilities
  async scanEndpoint(endpoint) {
    const vulnerabilities = [];

    // Check for common issues
    if (!endpoint.security?.authentication) {
      vulnerabilities.push({
        type: "BROKEN_AUTHENTICATION",
        severity: "high",
        description: "Endpoint does not require authentication",
        remediation: "Implement authentication for this endpoint",
        detectedAt: new Date(),
      });
    }

    // Check input validation
    const params = endpoint.parameters || [];
    const noValidation = params.filter((p) => !p.validation);
    if (noValidation.length > 0) {
      vulnerabilities.push({
        type: "IMPROPER_INPUT_VALIDATION",
        severity: "medium",
        description: `${noValidation.length} parameters lack validation rules`,
        remediation: "Add schema validation for all parameters",
        detectedAt: new Date(),
      });
    }

    // Check for sensitive data in path
    const sensitivePatterns = [
      "password",
      "token",
      "secret",
      "key",
      "ssn",
      "credit",
    ];
    for (const pattern of sensitivePatterns) {
      if (endpoint.path.toLowerCase().includes(pattern)) {
        vulnerabilities.push({
          type: "SENSITIVE_DATA_EXPOSURE",
          severity: "high",
          description: `Path may expose sensitive data: ${pattern}`,
          remediation: "Avoid including sensitive identifiers in URL paths",
          detectedAt: new Date(),
        });
        break;
      }
    }

    // Try ML-based scan
    try {
      const mlResult = await axios.post(
        `${ML_ENGINE_URL}/scan/endpoint`,
        {
          path: endpoint.path,
          method: endpoint.method,
          parameters: endpoint.parameters,
        },
        { timeout: 10000 }
      );

      if (mlResult.data.vulnerabilities) {
        vulnerabilities.push(...mlResult.data.vulnerabilities);
      }
    } catch (error) {
      // ML service not available, continue with basic scan
    }

    return {
      vulnerabilities,
      scannedAt: new Date(),
      totalIssues: vulnerabilities.length,
      bySeverity: vulnerabilities.reduce((acc, v) => {
        acc[v.severity] = (acc[v.severity] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}

module.exports = new APIService();
