/**
 * CryptoVault - Secret Controller
 */

const Secret = require("../models/Secret");
const cryptoService = require("../services/cryptoService");

exports.getAll = async (req, res) => {
  try {
    const {
      status,
      type,
      provider,
      application,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (provider) filter.provider = provider;
    if (application) filter["metadata.application"] = application;

    const skip = (page - 1) * limit;

    const [secrets, total] = await Promise.all([
      Secret.find(filter)
        .select("-value")
        .populate("vault", "name")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ updatedAt: -1 }),
      Secret.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: secrets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const secret = await Secret.findById(req.params.id)
      .select("-value")
      .populate("vault");

    if (!secret) {
      return res
        .status(404)
        .json({ success: false, error: "Secret not found" });
    }

    // Log access
    secret.usage.accessCount++;
    secret.usage.lastAccessed = new Date();
    await secret.save();

    res.json({ success: true, data: secret });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const secret = new Secret(req.body);
    await secret.save();

    // Return without actual value
    const response = secret.toObject();
    delete response.value;

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const secret = await Secret.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-value");

    if (!secret) {
      return res
        .status(404)
        .json({ success: false, error: "Secret not found" });
    }

    res.json({ success: true, data: secret });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const secret = await Secret.findById(req.params.id);

    if (!secret) {
      return res
        .status(404)
        .json({ success: false, error: "Secret not found" });
    }

    // Soft delete
    secret.status = "pending_deletion";
    await secret.save();

    res.json({ success: true, message: "Secret scheduled for deletion" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rotate = async (req, res) => {
  try {
    const secret = await Secret.findById(req.params.id);

    if (!secret) {
      return res
        .status(404)
        .json({ success: false, error: "Secret not found" });
    }

    // Increment version
    const versionNum = parseInt(secret.version.current.replace("v", "")) + 1;
    secret.version.current = `v${versionNum}`;
    secret.version.count++;
    secret.rotation.lastRotated = new Date();

    if (secret.rotation.enabled) {
      const nextRotation = new Date();
      nextRotation.setDate(
        nextRotation.getDate() + secret.rotation.intervalDays
      );
      secret.rotation.nextRotation = nextRotation;
    }

    await secret.save();

    res.json({
      success: true,
      data: {
        secretId: secret._id,
        newVersion: secret.version.current,
        rotatedAt: secret.rotation.lastRotated,
        nextRotation: secret.rotation.nextRotation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getVersions = async (req, res) => {
  try {
    const secret = await Secret.findById(req.params.id);

    if (!secret) {
      return res
        .status(404)
        .json({ success: false, error: "Secret not found" });
    }

    // Simulated version history
    const versions = [];
    for (let i = 1; i <= secret.version.count; i++) {
      versions.push({
        version: `v${i}`,
        createdAt: new Date(
          Date.now() - (secret.version.count - i) * 86400000 * 30
        ),
        status: i === secret.version.count ? "current" : "previous",
      });
    }

    res.json({
      success: true,
      data: {
        secretId: secret._id,
        currentVersion: secret.version.current,
        totalVersions: secret.version.count,
        versions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const secret = await Secret.findById(req.params.id);

    if (!secret) {
      return res
        .status(404)
        .json({ success: false, error: "Secret not found" });
    }

    const analysis = await cryptoService.analyzeSecret(secret);

    secret.riskScore = analysis.riskScore;
    secret.riskFactors = analysis.riskFactors;
    await secret.save();

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
