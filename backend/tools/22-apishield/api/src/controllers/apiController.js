const API = require("../models/API");
const Endpoint = require("../models/Endpoint");
const apiService = require("../services/apiService");

// Create API
exports.create = async (req, res, next) => {
  try {
    const api = new API(req.body);
    await api.save();
    res.status(201).json(api);
  } catch (error) {
    next(error);
  }
};

// Get all APIs
exports.getAll = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [apis, total] = await Promise.all([
      API.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("endpoints", "path method"),
      API.countDocuments(filter),
    ]);

    res.json({
      data: apis,
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

// Get API by ID
exports.getById = async (req, res, next) => {
  try {
    const api = await API.findById(req.params.id)
      .populate("endpoints")
      .populate("policies", "name type isActive");
    if (!api) {
      return res.status(404).json({ error: "API not found" });
    }
    res.json(api);
  } catch (error) {
    next(error);
  }
};

// Update API
exports.update = async (req, res, next) => {
  try {
    const api = await API.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!api) {
      return res.status(404).json({ error: "API not found" });
    }
    res.json(api);
  } catch (error) {
    next(error);
  }
};

// Delete API
exports.delete = async (req, res, next) => {
  try {
    const api = await API.findByIdAndDelete(req.params.id);
    if (!api) {
      return res.status(404).json({ error: "API not found" });
    }
    // Delete associated endpoints
    await Endpoint.deleteMany({ apiId: req.params.id });
    res.json({ message: "API deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Discover endpoints from specification
exports.discover = async (req, res, next) => {
  try {
    const api = await API.findById(req.params.id);
    if (!api) {
      return res.status(404).json({ error: "API not found" });
    }

    const { specificationUrl, specificationContent } = req.body;

    // Discover endpoints from spec
    const discovered = await apiService.discoverEndpoints(
      api,
      specificationUrl || api.specification?.url,
      specificationContent || api.specification?.content
    );

    // Create endpoints
    const endpoints = [];
    for (const endpoint of discovered) {
      const newEndpoint = new Endpoint({
        apiId: api._id,
        ...endpoint,
      });
      await newEndpoint.save();
      endpoints.push(newEndpoint);
    }

    // Update API with endpoints
    api.endpoints = endpoints.map((e) => e._id);
    await api.save();

    res.json({
      discovered: endpoints.length,
      endpoints,
    });
  } catch (error) {
    next(error);
  }
};

// Get security score
exports.getSecurityDashboard = async (req, res, next) => {
  try {
    const api = await API.findById(req.params.id).populate("endpoints");
    if (!api) {
      return res.status(404).json({ error: "API not found" });
    }

    const securityScore = await apiService.calculateSecurityDashboard(api);

    // Update API with score
    api.security = securityScore;
    await api.save();

    res.json(securityScore);
  } catch (error) {
    next(error);
  }
};
