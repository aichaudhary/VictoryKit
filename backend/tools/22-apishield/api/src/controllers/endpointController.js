const Endpoint = require("../models/Endpoint");
const apiService = require("../services/apiService");

// Create endpoint
exports.create = async (req, res, next) => {
  try {
    const endpoint = new Endpoint(req.body);
    await endpoint.save();
    res.status(201).json(endpoint);
  } catch (error) {
    next(error);
  }
};

// Get all endpoints
exports.getAll = async (req, res, next) => {
  try {
    const { apiId, method, deprecated, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (apiId) filter.apiId = apiId;
    if (method) filter.method = method;
    if (deprecated !== undefined) filter.isDeprecated = deprecated === "true";

    const skip = (page - 1) * limit;
    const [endpoints, total] = await Promise.all([
      Endpoint.find(filter)
        .sort({ path: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("apiId", "name baseUrl"),
      Endpoint.countDocuments(filter),
    ]);

    res.json({
      data: endpoints,
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

// Get endpoint by ID
exports.getById = async (req, res, next) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id).populate(
      "apiId",
      "name baseUrl authentication"
    );
    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }
    res.json(endpoint);
  } catch (error) {
    next(error);
  }
};

// Update endpoint
exports.update = async (req, res, next) => {
  try {
    const endpoint = await Endpoint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }
    res.json(endpoint);
  } catch (error) {
    next(error);
  }
};

// Delete endpoint
exports.delete = async (req, res, next) => {
  try {
    const endpoint = await Endpoint.findByIdAndDelete(req.params.id);
    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }
    res.json({ message: "Endpoint deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Scan endpoint for vulnerabilities
exports.scan = async (req, res, next) => {
  try {
    const endpoint = await Endpoint.findById(req.params.id).populate("apiId");
    if (!endpoint) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    // Perform security scan
    const scanResult = await apiService.scanEndpoint(endpoint);

    // Update vulnerabilities
    endpoint.vulnerabilities = scanResult.vulnerabilities;
    await endpoint.save();

    // Trigger external security integrations
    apiService.integrateWithSecurityStack(endpoint._id, {
      endpoint: endpoint.path,
      vulnerabilitiesCount: scanResult.vulnerabilities?.length || 0,
      criticalCount: scanResult.bySeverity?.critical || 0,
      highCount: scanResult.bySeverity?.high || 0,
      authIssues: scanResult.vulnerabilities?.filter(v => v.type === 'authentication').length || 0,
      routeId: endpoint.routeId,
      userId: req.user?.id
    }).catch(error => {
      console.error('Integration error:', error);
      // Don't fail the scan if integration fails
    });

    res.json({
      endpointId: endpoint.endpointId,
      path: endpoint.path,
      method: endpoint.method,
      scanResult,
    });
  } catch (error) {
    next(error);
  }
};
