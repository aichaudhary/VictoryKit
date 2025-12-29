const API = require("../models/API");
const Endpoint = require("../models/Endpoint");
const Anomaly = require("../models/Anomaly");

// Get usage analytics
exports.getUsage = async (req, res, next) => {
  try {
    const { apiId, startDate, endDate } = req.query;

    const filter = {};
    if (apiId) filter.apiId = apiId;

    const endpoints = await Endpoint.find(filter).select(
      "path method statistics"
    );

    const usage = {
      totalCalls: endpoints.reduce(
        (sum, e) => sum + (e.statistics?.totalCalls || 0),
        0
      ),
      avgSuccessRate:
        endpoints.length > 0
          ? endpoints.reduce(
              (sum, e) => sum + (e.statistics?.successRate || 100),
              0
            ) / endpoints.length
          : 100,
      avgLatency:
        endpoints.length > 0
          ? endpoints.reduce(
              (sum, e) => sum + (e.statistics?.avgLatency || 0),
              0
            ) / endpoints.length
          : 0,
      byEndpoint: endpoints.map((e) => ({
        path: e.path,
        method: e.method,
        calls: e.statistics?.totalCalls || 0,
        successRate: e.statistics?.successRate || 100,
        avgLatency: e.statistics?.avgLatency || 0,
      })),
      topEndpoints: endpoints
        .sort(
          (a, b) =>
            (b.statistics?.totalCalls || 0) - (a.statistics?.totalCalls || 0)
        )
        .slice(0, 10)
        .map((e) => ({
          path: e.path,
          method: e.method,
          calls: e.statistics?.totalCalls || 0,
        })),
    };

    res.json(usage);
  } catch (error) {
    next(error);
  }
};

// Get security analytics
exports.getSecurity = async (req, res, next) => {
  try {
    const apis = await API.find().select("name security");
    const endpoints = await Endpoint.find().select("vulnerabilities");

    // Count vulnerabilities by severity
    const vulnsBySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    for (const endpoint of endpoints) {
      for (const vuln of endpoint.vulnerabilities || []) {
        vulnsBySeverity[vuln.severity] =
          (vulnsBySeverity[vuln.severity] || 0) + 1;
      }
    }

    // API scores
    const apiScores = apis
      .filter((a) => a.security?.score !== undefined)
      .map((a) => ({
        name: a.name,
        score: a.security.score,
        grade: a.security.grade,
      }));

    const avgScore =
      apiScores.length > 0
        ? apiScores.reduce((sum, a) => sum + a.score, 0) / apiScores.length
        : 0;

    res.json({
      overview: {
        averageSecurityScore: Math.round(avgScore),
        totalVulnerabilities: Object.values(vulnsBySeverity).reduce(
          (a, b) => a + b,
          0
        ),
        criticalIssues: vulnsBySeverity.critical + vulnsBySeverity.high,
      },
      vulnerabilitiesBySeverity: vulnsBySeverity,
      apiScores: apiScores.sort((a, b) => a.score - b.score),
      lowestScoring: apiScores.slice(0, 5),
      recommendations: generateSecurityRecommendations(vulnsBySeverity),
    });
  } catch (error) {
    next(error);
  }
};

function generateSecurityRecommendations(vulns) {
  const recommendations = [];

  if (vulns.critical > 0) {
    recommendations.push({
      priority: "critical",
      message: `Address ${vulns.critical} critical vulnerabilities immediately`,
      action: "Review and remediate critical security issues",
    });
  }

  if (vulns.high > 0) {
    recommendations.push({
      priority: "high",
      message: `Fix ${vulns.high} high severity vulnerabilities`,
      action: "Schedule immediate remediation",
    });
  }

  return recommendations;
}

// Get anomalies
exports.getAnomalies = async (req, res, next) => {
  try {
    const { apiId, type, severity, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (apiId) filter.apiId = apiId;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [anomalies, total] = await Promise.all([
      Anomaly.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("apiId", "name")
        .populate("endpointId", "path method"),
      Anomaly.countDocuments(filter),
    ]);

    res.json({
      data: anomalies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [apis, endpoints, anomalies] = await Promise.all([
      API.find().select("name type status security"),
      Endpoint.find().select("vulnerabilities statistics"),
      Anomaly.find({ status: "open" }).select("type severity"),
    ]);

    // Count vulnerabilities
    let totalVulns = 0;
    let criticalVulns = 0;
    for (const endpoint of endpoints) {
      for (const vuln of endpoint.vulnerabilities || []) {
        totalVulns++;
        if (vuln.severity === "critical") criticalVulns++;
      }
    }

    const dashboard = {
      summary: {
        totalApis: apis.length,
        activeApis: apis.filter((a) => a.status === "active").length,
        totalEndpoints: endpoints.length,
        totalVulnerabilities: totalVulns,
        criticalVulnerabilities: criticalVulns,
        openAnomalies: anomalies.length,
      },
      apisByType: apis.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        return acc;
      }, {}),
      securityScores: apis
        .filter((a) => a.security?.score !== undefined)
        .map((a) => ({ name: a.name, score: a.security.score }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 10),
      anomaliesBySeverity: anomalies.reduce((acc, a) => {
        acc[a.severity] = (acc[a.severity] || 0) + 1;
        return acc;
      }, {}),
      recentAnomalies: anomalies.slice(0, 5),
    };

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};
