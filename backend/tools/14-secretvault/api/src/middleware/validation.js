/**
 * Validation Middleware
 * SecretVault API
 */

const validateKeyCreation = (req, res, next) => {
  const { name, type, algorithm } = req.body;

  if (!name || typeof name !== "string" || name.length < 1) {
    return res.status(400).json({
      success: false,
      error: "Key name is required",
    });
  }

  const validTypes = ["symmetric", "asymmetric", "hmac"];
  if (!type || !validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid key type. Must be one of: ${validTypes.join(", ")}`,
    });
  }

  const validAlgorithms = {
    symmetric: ["AES-128-GCM", "AES-256-GCM", "AES-256-CBC", "ChaCha20-Poly1305"],
    asymmetric: ["RSA-2048", "RSA-4096", "ECDSA-P256", "ECDSA-P384", "Ed25519"],
    hmac: ["HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"],
  };

  if (!algorithm || !validAlgorithms[type]?.includes(algorithm)) {
    return res.status(400).json({
      success: false,
      error: `Invalid algorithm for ${type}. Must be one of: ${validAlgorithms[type]?.join(", ")}`,
    });
  }

  next();
};

const validateEncryption = (req, res, next) => {
  const { keyId, data } = req.body;

  if (!keyId) {
    return res.status(400).json({
      success: false,
      error: "Key ID is required",
    });
  }

  if (!data || typeof data !== "string") {
    return res.status(400).json({
      success: false,
      error: "Data to encrypt is required",
    });
  }

  next();
};

const validateDecryption = (req, res, next) => {
  const { keyId, ciphertext } = req.body;

  if (!keyId) {
    return res.status(400).json({
      success: false,
      error: "Key ID is required",
    });
  }

  if (!ciphertext || typeof ciphertext !== "string") {
    return res.status(400).json({
      success: false,
      error: "Ciphertext is required",
    });
  }

  next();
};

module.exports = {
  validateKeyCreation,
  validateEncryption,
  validateDecryption,
};
