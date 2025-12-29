/**
 * CryptoVault - Certificate Controller
 */

const Certificate = require("../models/Certificate");
const cryptoService = require("../services/cryptoService");

exports.getAll = async (req, res) => {
  try {
    const { status, type, provider, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (provider) filter.provider = provider;

    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      Certificate.find(filter)
        .populate("vault", "name")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ "validity.notAfter": 1 }),
      Certificate.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: certificates,
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
    const certificate = await Certificate.findById(req.params.id).populate(
      "vault"
    );

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, error: "Certificate not found" });
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const certificate = new Certificate(req.body);
    await certificate.save();
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, error: "Certificate not found" });
    }

    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, error: "Certificate not found" });
    }

    res.json({ success: true, message: "Certificate deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.renew = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, error: "Certificate not found" });
    }

    // Simulate renewal
    const now = new Date();
    const newExpiry = new Date(now);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    certificate.validity.notBefore = now;
    certificate.validity.notAfter = newExpiry;
    certificate.status = "active";
    await certificate.save();

    res.json({
      success: true,
      data: {
        certificateId: certificate._id,
        renewedAt: now,
        newExpiry: newExpiry,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.validate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res
        .status(404)
        .json({ success: false, error: "Certificate not found" });
    }

    const validation = await cryptoService.validateCertificate(certificate);

    certificate.lastValidated = new Date();
    certificate.validationErrors = validation.errors;
    certificate.riskScore = validation.riskScore;
    await certificate.save();

    res.json({ success: true, data: validation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExpiring = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + parseInt(days));

    const expiringCertificates = await Certificate.find({
      status: "active",
      "validity.notAfter": { $lte: cutoffDate },
    }).sort({ "validity.notAfter": 1 });

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        count: expiringCertificates.length,
        certificates: expiringCertificates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
