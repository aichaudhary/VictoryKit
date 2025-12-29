const Component = require("../models/Component");
const Threat = require("../models/Threat");
const ThreatModel = require("../models/ThreatModel");

// Create component
exports.create = async (req, res, next) => {
  try {
    const component = new Component(req.body);
    await component.save();

    // Link to threat model
    if (component.threatModelId) {
      await ThreatModel.findByIdAndUpdate(component.threatModelId, {
        $push: { components: component._id },
      });
    }

    res.status(201).json(component);
  } catch (error) {
    next(error);
  }
};

// Get all components
exports.getAll = async (req, res, next) => {
  try {
    const { threatModelId, type, trustLevel, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (threatModelId) filter.threatModelId = threatModelId;
    if (type) filter.type = type;
    if (trustLevel) filter.trustLevel = trustLevel;

    const skip = (page - 1) * limit;
    const [components, total] = await Promise.all([
      Component.find(filter)
        .populate("dependencies.componentId", "name type")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Component.countDocuments(filter),
    ]);

    res.json({
      data: components,
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

// Get component by ID
exports.getById = async (req, res, next) => {
  try {
    const component = await Component.findById(req.params.id)
      .populate("threatModelId", "name")
      .populate("dependencies.componentId")
      .populate("threats");

    if (!component) {
      return res.status(404).json({ error: "Component not found" });
    }
    res.json(component);
  } catch (error) {
    next(error);
  }
};

// Update component
exports.update = async (req, res, next) => {
  try {
    const component = await Component.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!component) {
      return res.status(404).json({ error: "Component not found" });
    }
    res.json(component);
  } catch (error) {
    next(error);
  }
};

// Delete component
exports.delete = async (req, res, next) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);

    if (!component) {
      return res.status(404).json({ error: "Component not found" });
    }

    // Remove from threat model
    if (component.threatModelId) {
      await ThreatModel.findByIdAndUpdate(component.threatModelId, {
        $pull: { components: component._id },
      });
    }

    res.json({ message: "Component deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get threats for component
exports.getThreats = async (req, res, next) => {
  try {
    const component = await Component.findById(req.params.id);

    if (!component) {
      return res.status(404).json({ error: "Component not found" });
    }

    const threats = await Threat.find({
      affectedComponents: req.params.id,
    }).populate("mitigations");

    // Generate threat suggestions based on component type
    const suggestions = generateThreatSuggestions(component);

    res.json({
      component: {
        id: component._id,
        name: component.name,
        type: component.type,
      },
      threats,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

function generateThreatSuggestions(component) {
  const suggestions = {
    web_server: [
      {
        category: "denial_of_service",
        name: "DDoS Attack",
        description: "Distributed denial of service attack on web server",
      },
      {
        category: "injection",
        name: "SQL Injection",
        description: "SQL injection through web forms",
      },
      {
        category: "spoofing",
        name: "Session Hijacking",
        description: "Session token theft or hijacking",
      },
    ],
    database: [
      {
        category: "information_disclosure",
        name: "Data Breach",
        description: "Unauthorized access to database data",
      },
      {
        category: "tampering",
        name: "Data Tampering",
        description: "Unauthorized modification of data",
      },
      {
        category: "elevation_of_privilege",
        name: "Privilege Escalation",
        description: "Gaining elevated database permissions",
      },
    ],
    api: [
      {
        category: "spoofing",
        name: "API Key Theft",
        description: "Stolen or compromised API keys",
      },
      {
        category: "tampering",
        name: "Request Tampering",
        description: "Manipulation of API requests",
      },
      {
        category: "repudiation",
        name: "Insufficient Logging",
        description: "Lack of API audit trail",
      },
    ],
    external_service: [
      {
        category: "information_disclosure",
        name: "Data Leakage",
        description: "Sensitive data exposed to third party",
      },
      {
        category: "denial_of_service",
        name: "Service Dependency",
        description: "Single point of failure from external service",
      },
    ],
  };

  return (
    suggestions[component.type] || [
      {
        category: "other",
        name: "Generic Threat",
        description: "Assess component-specific threats",
      },
    ]
  );
}
