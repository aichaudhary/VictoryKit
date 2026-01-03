/**
 * Encryption Controller
 * Handles data encryption/decryption operations
 */

const { EncryptionKey } = require("../models");
const { encryptionService, auditService, websocketService } = require("../services");

// Encrypt data using a specific key
exports.encrypt = async (req, res) => {
  try {
    const { keyId, data, encoding = "utf8" } = req.body;

    const key = await EncryptionKey.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    if (key.status !== "active") {
      return res.status(400).json({ success: false, error: "Key is not active" });
    }

    if (key.type !== "symmetric") {
      return res.status(400).json({ 
        success: false, 
        error: "Only symmetric keys can be used for encryption" 
      });
    }

    // Decrypt key material for use
    const keyMaterial = await encryptionService.decryptKeyMaterial(key.keyMaterial.encrypted);

    // Perform encryption
    let result;
    if (key.algorithm.includes("GCM")) {
      const keySize = key.algorithm.includes("128") ? 128 : 256;
      result = await encryptionService.encryptAESGCM(data, keyMaterial, keySize);
    } else if (key.algorithm.includes("CBC")) {
      result = await encryptionService.encryptAESCBC(data, keyMaterial);
    } else {
      result = await encryptionService.encryptAESGCM(data, keyMaterial, 256);
    }

    // Update usage stats
    key.usageCount = (key.usageCount || 0) + 1;
    key.lastUsed = new Date();
    await key.save();

    // Audit log
    await auditService.log({
      operation: "key.encrypt",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { 
        dataSize: data.length,
        algorithm: key.algorithm,
      },
    });

    websocketService.broadcast("encryption-operation", {
      operation: "encrypt",
      keyId: key._id,
      keyName: key.name,
      status: "success",
    });

    res.json({
      success: true,
      data: {
        ciphertext: result.ciphertext,
        algorithm: result.algorithm,
        keyId: key._id,
        keyName: key.name,
      },
    });
  } catch (error) {
    console.error("Encryption error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Decrypt data using a specific key
exports.decrypt = async (req, res) => {
  try {
    const { keyId, ciphertext } = req.body;

    const key = await EncryptionKey.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    if (key.status !== "active") {
      return res.status(400).json({ success: false, error: "Key is not active" });
    }

    if (key.type !== "symmetric") {
      return res.status(400).json({ 
        success: false, 
        error: "Only symmetric keys can be used for decryption" 
      });
    }

    // Decrypt key material for use
    const keyMaterial = await encryptionService.decryptKeyMaterial(key.keyMaterial.encrypted);

    // Perform decryption
    let result;
    if (key.algorithm.includes("GCM")) {
      const keySize = key.algorithm.includes("128") ? 128 : 256;
      result = await encryptionService.decryptAESGCM(ciphertext, keyMaterial, keySize);
    } else if (key.algorithm.includes("CBC")) {
      result = await encryptionService.decryptAESCBC(ciphertext, keyMaterial);
    } else {
      result = await encryptionService.decryptAESGCM(ciphertext, keyMaterial, 256);
    }

    // Update usage stats
    key.usageCount = (key.usageCount || 0) + 1;
    key.lastUsed = new Date();
    await key.save();

    // Audit log
    await auditService.log({
      operation: "key.decrypt",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { algorithm: key.algorithm },
    });

    websocketService.broadcast("encryption-operation", {
      operation: "decrypt",
      keyId: key._id,
      keyName: key.name,
      status: "success",
    });

    res.json({
      success: true,
      data: {
        plaintext: result.plaintext,
        algorithm: result.algorithm,
        keyId: key._id,
        keyName: key.name,
      },
    });
  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({ success: false, error: "Decryption failed" });
  }
};

// Sign data using asymmetric key
exports.sign = async (req, res) => {
  try {
    const { keyId, data, encoding = "utf8" } = req.body;

    const key = await EncryptionKey.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    if (key.status !== "active") {
      return res.status(400).json({ success: false, error: "Key is not active" });
    }

    if (key.type !== "asymmetric") {
      return res.status(400).json({ 
        success: false, 
        error: "Only asymmetric keys can be used for signing" 
      });
    }

    // Decrypt private key for signing
    const privateKey = await encryptionService.decryptKeyMaterial(key.keyMaterial.encrypted);

    // Sign data
    const signature = await encryptionService.signData(data, privateKey, key.algorithm);

    // Update usage stats
    key.usageCount = (key.usageCount || 0) + 1;
    key.lastUsed = new Date();
    await key.save();

    await auditService.log({
      operation: "key.sign",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { dataSize: data.length, algorithm: key.algorithm },
    });

    res.json({
      success: true,
      data: {
        signature,
        algorithm: key.algorithm,
        keyId: key._id,
      },
    });
  } catch (error) {
    console.error("Signing error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify signature using asymmetric key
exports.verify = async (req, res) => {
  try {
    const { keyId, data, signature } = req.body;

    const key = await EncryptionKey.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    if (key.type !== "asymmetric") {
      return res.status(400).json({ 
        success: false, 
        error: "Only asymmetric keys can be used for verification" 
      });
    }

    // Verify using public key
    const isValid = await encryptionService.verifySignature(
      data, 
      signature, 
      key.keyMaterial.publicKey, 
      key.algorithm
    );

    // Update usage stats
    key.usageCount = (key.usageCount || 0) + 1;
    key.lastUsed = new Date();
    await key.save();

    await auditService.log({
      operation: "key.verify",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { valid: isValid, algorithm: key.algorithm },
    });

    res.json({
      success: true,
      data: {
        valid: isValid,
        keyId: key._id,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Generate HMAC
exports.generateHMAC = async (req, res) => {
  try {
    const { keyId, data } = req.body;

    const key = await EncryptionKey.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    if (key.status !== "active") {
      return res.status(400).json({ success: false, error: "Key is not active" });
    }

    if (key.type !== "hmac") {
      return res.status(400).json({ 
        success: false, 
        error: "Only HMAC keys can be used for HMAC generation" 
      });
    }

    const keyMaterial = await encryptionService.decryptKeyMaterial(key.keyMaterial.encrypted);
    const hmac = await encryptionService.generateHMAC(data, keyMaterial, key.algorithm);

    key.usageCount = (key.usageCount || 0) + 1;
    key.lastUsed = new Date();
    await key.save();

    await auditService.log({
      operation: "key.encrypt",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { algorithm: key.algorithm },
    });

    res.json({
      success: true,
      data: {
        hmac,
        algorithm: key.algorithm,
        keyId: key._id,
      },
    });
  } catch (error) {
    console.error("HMAC error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify HMAC
exports.verifyHMAC = async (req, res) => {
  try {
    const { keyId, data, hmac } = req.body;

    const key = await EncryptionKey.findById(keyId);
    if (!key) {
      return res.status(404).json({ success: false, error: "Key not found" });
    }

    if (key.type !== "hmac") {
      return res.status(400).json({ 
        success: false, 
        error: "Only HMAC keys can be used for verification" 
      });
    }

    const keyMaterial = await encryptionService.decryptKeyMaterial(key.keyMaterial.encrypted);
    const expectedHMAC = await encryptionService.generateHMAC(data, keyMaterial, key.algorithm);
    const isValid = hmac === expectedHMAC;

    key.usageCount = (key.usageCount || 0) + 1;
    key.lastUsed = new Date();
    await key.save();

    await auditService.log({
      operation: "key.verify",
      resourceType: "key",
      resourceId: key._id,
      resourceName: key.name,
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { valid: isValid, algorithm: key.algorithm },
    });

    res.json({
      success: true,
      data: {
        valid: isValid,
        keyId: key._id,
      },
    });
  } catch (error) {
    console.error("HMAC verification error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
