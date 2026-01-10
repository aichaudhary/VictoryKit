/**
 * PrivilegeGuard - Vault Controller
 */

const Vault = require("../models/Vault");
const Key = require("../models/Key");
const Certificate = require("../models/Certificate");
const Secret = require("../models/Secret");

exports.getAll = async (req, res) => {
  try {
    const { status, provider, type, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const [vaults, total] = await Promise.all([
      Vault.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Vault.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: vaults,
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
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({ success: false, error: "Vault not found" });
    }

    res.json({ success: true, data: vault });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const vault = new Vault(req.body);
    await vault.save();
    res.status(201).json({ success: true, data: vault });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const vault = await Vault.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vault) {
      return res.status(404).json({ success: false, error: "Vault not found" });
    }

    res.json({ success: true, data: vault });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({ success: false, error: "Vault not found" });
    }

    // Check for associated items
    const [keyCount, secretCount, certCount] = await Promise.all([
      Key.countDocuments({ vault: vault._id }),
      Secret.countDocuments({ vault: vault._id }),
      Certificate.countDocuments({ vault: vault._id }),
    ]);

    if (keyCount + secretCount + certCount > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete vault with associated keys, secrets, or certificates",
      });
    }

    await Vault.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Vault deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({ success: false, error: "Vault not found" });
    }

    // Simulated audit log
    const auditLog = [
      {
        action: "KEY_CREATED",
        resource: "encryption-key-1",
        user: "admin@example.com",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        action: "SECRET_ACCESSED",
        resource: "db-password",
        user: "app-service",
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        action: "CERTIFICATE_RENEWED",
        resource: "ssl-cert-prod",
        user: "system",
        timestamp: new Date(Date.now() - 86400000),
      },
      {
        action: "KEY_ROTATED",
        resource: "master-key",
        user: "admin@example.com",
        timestamp: new Date(Date.now() - 172800000),
      },
    ];

    res.json({
      success: true,
      data: {
        vaultId: vault._id,
        vaultName: vault.name,
        auditLog,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: auditLog.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const vault = await Vault.findById(req.params.id);

    if (!vault) {
      return res.status(404).json({ success: false, error: "Vault not found" });
    }

    // Get statistics
    const [
      keyCount,
      secretCount,
      certCount,
      expiringCerts,
      keysNeedingRotation,
    ] = await Promise.all([
      Key.countDocuments({ vault: vault._id, status: "active" }),
      Secret.countDocuments({ vault: vault._id, status: "active" }),
      Certificate.countDocuments({ vault: vault._id, status: "active" }),
      Certificate.countDocuments({
        vault: vault._id,
        status: "active",
        "validity.daysRemaining": { $lte: 30 },
      }),
      Key.countDocuments({
        vault: vault._id,
        status: "active",
        "rotation.nextRotation": { $lte: new Date() },
      }),
    ]);

    // Update vault statistics
    vault.statistics.keyCount = keyCount;
    vault.statistics.secretCount = secretCount;
    vault.statistics.certificateCount = certCount;
    await vault.save();

    res.json({
      success: true,
      data: {
        vaultId: vault._id,
        vaultName: vault.name,
        status: vault.status,
        statistics: {
          keys: keyCount,
          secrets: secretCount,
          certificates: certCount,
          total: keyCount + secretCount + certCount,
        },
        alerts: {
          expiringCertificates: expiringCerts,
          keysNeedingRotation: keysNeedingRotation,
        },
        compliance: vault.compliance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
