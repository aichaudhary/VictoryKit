/**
 * Key Controller
 * Handles encryption key management operations
 */

const { EncryptionKey, AuditLog } = require("../models");
const { encryptionService, auditService, websocketService, notificationService } = require("../services");

// Get all keys with filtering
exports.getKeys = async (req, res) => {
  try {
    const { type, status, provider, limit = 50, page = 1 } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (provider) filter.provider = provider;

    const keys = await EncryptionKey.find(filter)
      .select("-keyMaterial.encrypted -keyMaterial.privateKey")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await EncryptionKey.countDocuments(filter);

    res.json({
      success: true,
      data: keys,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching keys:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single key by ID
exports.getKey = async (req, res) => {
  try {
    const key = await EncryptionKey.findById(req.params.id)
      .select("-keyMaterial.encrypted -keyMaterial.privateKey");

    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    await auditService.log({
      operation: "key.read",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
    });

    res.json({ success: true, data: key });
  } catch (error) {
    console.error("Error fetching key:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new key
exports.createKey = async (req, res) => {
  try {
    const { name, type, algorithm, description, provider = "local", rotationPolicy } = req.body;

    // Check for duplicate name
    const existing = await EncryptionKey.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, error: "Key with this name already exists" });
    }

    // Generate key material
    let keyData;
    if (type === "symmetric") {
      keyData = await encryptionService.generateSymmetricKey(algorithm);
    } else if (type === "asymmetric") {
      keyData = await encryptionService.generateAsymmetricKeyPair(algorithm);
    } else if (type === "hmac") {
      keyData = await encryptionService.generateHMACKey(algorithm);
    }

    // Create key record
    const key = new EncryptionKey({
      name,
      description,
      type,
      algorithm,
      keySize: keyData.keySize,
      provider,
      keyMaterial: {
        encrypted: type === "symmetric" || type === "hmac" 
          ? await encryptionService.encryptKeyMaterial(keyData.key || keyData.hmacKey)
          : await encryptionService.encryptKeyMaterial(keyData.privateKey),
        publicKey: keyData.publicKey || null,
      },
      rotationPolicy: rotationPolicy || { enabled: false },
      status: "active",
      activatedAt: new Date(),
      createdBy: req.user?.id || req.headers["x-user-id"] || "system",
    });

    await key.save();

    // Log audit
    await auditService.log({
      operation: "key.create",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { type, algorithm, provider },
    });

    // Broadcast via WebSocket
    websocketService.broadcast("key-created", {
      keyId: key._id,
      name: key.name,
      type: key.type,
    });

    // Return without sensitive data
    const responseKey = key.toObject();
    delete responseKey.keyMaterial;

    res.status(201).json({ success: true, data: responseKey });
  } catch (error) {
    console.error("Error creating key:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Rotate key
exports.rotateKey = async (req, res) => {
  try {
    const key = await EncryptionKey.findById(req.params.id);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    if (key.status !== "active") {
      return res.status(400).json({ success: false, error: "Can only rotate active keys" });
    }

    // Generate new key material
    let newKeyData;
    if (key.type === "symmetric") {
      newKeyData = await encryptionService.generateSymmetricKey(key.algorithm);
    } else if (key.type === "asymmetric") {
      newKeyData = await encryptionService.generateAsymmetricKeyPair(key.algorithm);
    } else {
      newKeyData = await encryptionService.generateHMACKey(key.algorithm);
    }

    // Update key with new material
    key.keyMaterial = {
      encrypted: key.type === "symmetric" || key.type === "hmac"
        ? await encryptionService.encryptKeyMaterial(newKeyData.key || newKeyData.hmacKey)
        : await encryptionService.encryptKeyMaterial(newKeyData.privateKey),
      publicKey: newKeyData.publicKey || null,
    };
    key.lastRotatedAt = new Date();
    key.version = (key.version || 1) + 1;

    if (key.rotationPolicy?.enabled) {
      key.rotationPolicy.lastRotation = new Date();
      key.rotationPolicy.nextRotation = new Date(
        Date.now() + (key.rotationPolicy.intervalDays || 90) * 24 * 60 * 60 * 1000
      );
    }

    await key.save();

    await auditService.log({
      operation: "key.rotate",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      changes: { newVersion: key.version },
    });

    websocketService.broadcast("key-rotated", {
      keyId: key._id,
      name: key.name,
      version: key.version,
    });

    const responseKey = key.toObject();
    delete responseKey.keyMaterial;

    res.json({ success: true, data: responseKey, message: "Key rotated successfully" });
  } catch (error) {
    console.error("Error rotating key:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update key status
exports.updateKeyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["active", "inactive", "compromised", "pending-deletion"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const key = await EncryptionKey.findById(req.params.id);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    const oldStatus = key.status;
    key.status = status;

    if (status === "pending-deletion") {
      key.scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    await key.save();

    await auditService.log({
      operation: "key.update",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      changes: { oldStatus, newStatus: status },
    });

    if (status === "compromised") {
      await notificationService.sendAlert({
        type: "key-compromised",
        severity: "critical",
        keyId: key._id,
        keyName: key.name,
      });
    }

    websocketService.broadcast("key-status-changed", {
      keyId: key._id,
      name: key.name,
      oldStatus,
      newStatus: status,
    });

    res.json({ success: true, data: key });
  } catch (error) {
    console.error("Error updating key status:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete key (schedule for deletion)
exports.deleteKey = async (req, res) => {
  try {
    const key = await EncryptionKey.findById(req.params.id);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    const { force } = req.query;

    if (force === "true") {
      await EncryptionKey.findByIdAndDelete(req.params.id);
      await auditService.log({
        operation: "key.delete",
        resourceType: "key",
        resourceId: key._id,
        resourceName: key.name,
        actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
        changes: { forced: true },
      });
    } else {
      key.status = "pending-deletion";
      key.scheduledDeletionAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await key.save();
      await auditService.log({
        operation: "key.deactivate",
        resourceType: "key",
        resourceId: key._id,
        resourceName: key.name,
        actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
        changes: { scheduledFor: key.scheduledDeletionAt },
      });
    }

    websocketService.broadcast("key-deleted", { keyId: key._id, name: key.name });

    res.json({ success: true, message: force === "true" ? "Key deleted" : "Key scheduled for deletion" });
  } catch (error) {
    console.error("Error deleting key:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get key usage statistics
exports.getKeyStats = async (req, res) => {
  try {
    const key = await EncryptionKey.findById(req.params.id);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    const logs = await AuditLog.find({
      keyId: key._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ createdAt: -1 });

    const stats = {
      keyId: key._id,
      name: key.name,
      usageCount: key.usageCount || 0,
      lastUsed: key.lastUsed,
      operationsLast30Days: logs.length,
      operationsByType: logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error getting key stats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
