/**
 * CryptoVault - Key Controller
 */

const Key = require("../models/Key");
const cryptoService = require("../services/cryptoService");

exports.getAll = async (req, res) => {
  try {
    const {
      status,
      keyType,
      provider,
      algorithm,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (keyType) filter.keyType = keyType;
    if (provider) filter.provider = provider;
    if (algorithm) filter.algorithm = algorithm;

    const skip = (page - 1) * limit;

    const [keys, total] = await Promise.all([
      Key.find(filter)
        .populate("vault", "name")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Key.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: keys,
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
    const key = await Key.findById(req.params.id).populate("vault");

    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    res.json({ success: true, data: key });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const key = new Key(req.body);

    if (!key.rotation.lastRotated) {
      key.rotation.lastRotated = new Date();
    }

    await key.save();
    res.status(201).json({ success: true, data: key });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const key = await Key.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    res.json({ success: true, data: key });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    // Soft delete - mark as pending deletion
    key.status = "pending_deletion";
    await key.save();

    res.json({ success: true, message: "Key scheduled for deletion" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.rotate = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    // Perform rotation
    key.rotation.lastRotated = new Date();
    const nextRotation = new Date();
    nextRotation.setDate(nextRotation.getDate() + key.rotation.intervalDays);
    key.rotation.nextRotation = nextRotation;

    await key.save();

    res.json({
      success: true,
      data: {
        keyId: key._id,
        rotatedAt: key.rotation.lastRotated,
        nextRotation: key.rotation.nextRotation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.analyze = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    const analysis = await cryptoService.analyzeKey(key);

    key.riskScore = analysis.riskScore;
    await key.save();

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUsage = async (req, res) => {
  try {
    const key = await Key.findById(req.params.id);

    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    res.json({
      success: true,
      data: {
        keyId: key._id,
        usage: key.usage,
        lastRotated: key.rotation.lastRotated,
        nextRotation: key.rotation.nextRotation,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.encrypt = async (req, res) => {
  try {
    const { keyId, plaintext } = req.body;

    if (!keyId || !plaintext) {
      return res.status(400).json({
        success: false,
        error: "keyId and plaintext are required",
      });
    }

    const key = await Key.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    // Simulate encryption
    const ciphertext = Buffer.from(plaintext).toString("base64");

    key.usage.encryptCount++;
    key.usage.lastUsed = new Date();
    await key.save();

    res.json({
      success: true,
      data: {
        keyId: key._id,
        ciphertext,
        algorithm: key.algorithm,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.decrypt = async (req, res) => {
  try {
    const { keyId, ciphertext } = req.body;

    if (!keyId || !ciphertext) {
      return res.status(400).json({
        success: false,
        error: "keyId and ciphertext are required",
      });
    }

    const key = await Key.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    // Simulate decryption
    const plaintext = Buffer.from(ciphertext, "base64").toString("utf8");

    key.usage.decryptCount++;
    key.usage.lastUsed = new Date();
    await key.save();

    res.json({
      success: true,
      data: {
        keyId: key._id,
        plaintext,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
