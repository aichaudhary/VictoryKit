/**
 * Encryption Service
 * Core encryption/decryption operations with multiple algorithm support
 */

const crypto = require("crypto");

class EncryptionService {
  constructor() {
    this.supportedAlgorithms = {
      symmetric: ["AES-128-GCM", "AES-256-GCM", "AES-256-CBC", "ChaCha20-Poly1305"],
      asymmetric: ["RSA-2048", "RSA-4096", "ECDSA-P256", "ECDSA-P384"],
      hmac: ["HMAC-SHA256", "HMAC-SHA384", "HMAC-SHA512"]
    };
  }

  // ==========================================
  // Symmetric Encryption
  // ==========================================
  
  async encryptAESGCM(plaintext, key, keySize = 256) {
    const iv = crypto.randomBytes(12);
    const algorithm = keySize === 128 ? "aes-128-gcm" : "aes-256-gcm";
    const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, "hex");
    
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    
    let encrypted = cipher.update(plaintext, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext: Buffer.concat([iv, authTag, encrypted]).toString("base64"),
      algorithm: keySize === 128 ? "AES-128-GCM" : "AES-256-GCM",
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64")
    };
  }

  async decryptAESGCM(ciphertextB64, key, keySize = 256) {
    const data = Buffer.from(ciphertextB64, "base64");
    const iv = data.slice(0, 12);
    const authTag = data.slice(12, 28);
    const encrypted = data.slice(28);
    
    const algorithm = keySize === 128 ? "aes-128-gcm" : "aes-256-gcm";
    const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, "hex");
    
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return {
      plaintext: decrypted.toString("utf8"),
      algorithm: keySize === 128 ? "AES-128-GCM" : "AES-256-GCM"
    };
  }

  async encryptAESCBC(plaintext, key) {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, "hex");
    
    const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
    
    let encrypted = cipher.update(plaintext, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return {
      ciphertext: Buffer.concat([iv, encrypted]).toString("base64"),
      algorithm: "AES-256-CBC",
      iv: iv.toString("base64")
    };
  }

  async decryptAESCBC(ciphertextB64, key) {
    const data = Buffer.from(ciphertextB64, "base64");
    const iv = data.slice(0, 16);
    const encrypted = data.slice(16);
    
    const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return {
      plaintext: decrypted.toString("utf8"),
      algorithm: "AES-256-CBC"
    };
  }

  // ==========================================
  // Key Generation
  // ==========================================
  
  async generateSymmetricKey(algorithm = "AES-256-GCM") {
    let keySize;
    switch (algorithm) {
      case "AES-128-GCM": keySize = 16; break;
      case "AES-256-GCM":
      case "AES-256-CBC":
      case "ChaCha20-Poly1305":
      default: keySize = 32;
    }
    
    const key = crypto.randomBytes(keySize);
    
    return {
      key: key.toString("hex"),
      keySize: keySize * 8,
      algorithm,
      createdAt: new Date().toISOString()
    };
  }

  async generateAsymmetricKeyPair(algorithm = "RSA-4096") {
    return new Promise((resolve, reject) => {
      const [type, size] = algorithm.split("-");
      
      if (type === "RSA") {
        crypto.generateKeyPair("rsa", {
          modulusLength: parseInt(size) || 4096,
          publicKeyEncoding: { type: "spki", format: "pem" },
          privateKeyEncoding: { type: "pkcs8", format: "pem" }
        }, (err, publicKey, privateKey) => {
          if (err) return reject(err);
          resolve({
            publicKey,
            privateKey,
            algorithm,
            keySize: parseInt(size) || 4096,
            createdAt: new Date().toISOString()
          });
        });
      } else if (type === "ECDSA") {
        const curve = size === "P256" ? "prime256v1" : 
                     size === "P384" ? "secp384r1" : "secp521r1";
        
        crypto.generateKeyPair("ec", {
          namedCurve: curve,
          publicKeyEncoding: { type: "spki", format: "pem" },
          privateKeyEncoding: { type: "pkcs8", format: "pem" }
        }, (err, publicKey, privateKey) => {
          if (err) return reject(err);
          resolve({
            publicKey,
            privateKey,
            algorithm,
            curve,
            createdAt: new Date().toISOString()
          });
        });
      } else if (type === "Ed25519" || algorithm === "Ed25519") {
        crypto.generateKeyPair("ed25519", {
          publicKeyEncoding: { type: "spki", format: "pem" },
          privateKeyEncoding: { type: "pkcs8", format: "pem" }
        }, (err, publicKey, privateKey) => {
          if (err) return reject(err);
          resolve({
            publicKey,
            privateKey,
            algorithm: "Ed25519",
            createdAt: new Date().toISOString()
          });
        });
      } else {
        reject(new Error(`Unsupported algorithm: ${algorithm}`));
      }
    });
  }

  async generateHMACKey(algorithm = "HMAC-SHA256") {
    const keySize = algorithm.includes("512") ? 64 : 
                   algorithm.includes("384") ? 48 : 32;
    
    const key = crypto.randomBytes(keySize);
    
    return {
      key: key.toString("hex"),
      keySize: keySize * 8,
      algorithm,
      createdAt: new Date().toISOString()
    };
  }

  // ==========================================
  // Digital Signatures
  // ==========================================
  
  async sign(data, privateKey, algorithm = "RSA-SHA256") {
    const sign = crypto.createSign(algorithm.replace("RSA-", "").replace("ECDSA-", ""));
    sign.update(data);
    sign.end();
    
    const signature = sign.sign(privateKey, "base64");
    
    return {
      signature,
      algorithm,
      timestamp: new Date().toISOString()
    };
  }

  async verify(data, signature, publicKey, algorithm = "RSA-SHA256") {
    const verify = crypto.createVerify(algorithm.replace("RSA-", "").replace("ECDSA-", ""));
    verify.update(data);
    verify.end();
    
    const isValid = verify.verify(publicKey, signature, "base64");
    
    return {
      valid: isValid,
      algorithm,
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================
  // HMAC Operations
  // ==========================================
  
  async createHMAC(data, key, algorithm = "sha256") {
    const hmac = crypto.createHmac(algorithm, Buffer.from(key, "hex"));
    hmac.update(data);
    
    return {
      mac: hmac.digest("hex"),
      algorithm: `HMAC-${algorithm.toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
  }

  async verifyHMAC(data, mac, key, algorithm = "sha256") {
    const hmac = crypto.createHmac(algorithm, Buffer.from(key, "hex"));
    hmac.update(data);
    const expectedMac = hmac.digest("hex");
    
    const isValid = crypto.timingSafeEqual(
      Buffer.from(mac, "hex"),
      Buffer.from(expectedMac, "hex")
    );
    
    return {
      valid: isValid,
      algorithm: `HMAC-${algorithm.toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================
  // Key Wrapping
  // ==========================================
  
  async wrapKey(keyToWrap, wrappingKey) {
    // AES Key Wrap (RFC 3394)
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(wrappingKey, "hex"), iv);
    
    let wrapped = cipher.update(Buffer.from(keyToWrap, "hex"));
    wrapped = Buffer.concat([wrapped, cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return {
      wrappedKey: Buffer.concat([iv, authTag, wrapped]).toString("base64"),
      algorithm: "AES-256-GCM-WRAP",
      timestamp: new Date().toISOString()
    };
  }

  async unwrapKey(wrappedKeyB64, wrappingKey) {
    const data = Buffer.from(wrappedKeyB64, "base64");
    const iv = data.slice(0, 16);
    const authTag = data.slice(16, 32);
    const wrapped = data.slice(32);
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(wrappingKey, "hex"), iv);
    decipher.setAuthTag(authTag);
    
    let unwrapped = decipher.update(wrapped);
    unwrapped = Buffer.concat([unwrapped, decipher.final()]);
    
    return {
      key: unwrapped.toString("hex"),
      algorithm: "AES-256-GCM-WRAP",
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================
  // Key Derivation
  // ==========================================
  
  async deriveKey(password, salt, options = {}) {
    const {
      iterations = 100000,
      keyLength = 32,
      digest = "sha256"
    } = options;

    return new Promise((resolve, reject) => {
      const saltBuffer = salt ? Buffer.from(salt, "hex") : crypto.randomBytes(16);
      
      crypto.pbkdf2(password, saltBuffer, iterations, keyLength, digest, (err, derivedKey) => {
        if (err) return reject(err);
        resolve({
          key: derivedKey.toString("hex"),
          salt: saltBuffer.toString("hex"),
          iterations,
          keyLength: keyLength * 8,
          algorithm: `PBKDF2-${digest.toUpperCase()}`,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async deriveKeyHKDF(inputKey, salt, info, keyLength = 32) {
    const saltBuffer = salt ? Buffer.from(salt, "hex") : crypto.randomBytes(16);
    const infoBuffer = Buffer.from(info || "");
    
    const derivedKey = crypto.hkdfSync(
      "sha256",
      Buffer.from(inputKey, "hex"),
      saltBuffer,
      infoBuffer,
      keyLength
    );
    
    return {
      key: Buffer.from(derivedKey).toString("hex"),
      salt: saltBuffer.toString("hex"),
      info,
      keyLength: keyLength * 8,
      algorithm: "HKDF-SHA256",
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================
  // Hashing
  // ==========================================
  
  hash(data, algorithm = "sha256") {
    return crypto.createHash(algorithm).update(data).digest("hex");
  }

  // ==========================================
  // Unified Encrypt/Decrypt
  // ==========================================
  
  async encrypt(plaintext, key, algorithm = "AES-256-GCM") {
    switch (algorithm) {
      case "AES-128-GCM":
        return this.encryptAESGCM(plaintext, key, 128);
      case "AES-256-GCM":
        return this.encryptAESGCM(plaintext, key, 256);
      case "AES-256-CBC":
        return this.encryptAESCBC(plaintext, key);
      default:
        return this.encryptAESGCM(plaintext, key, 256);
    }
  }

  async decrypt(ciphertext, key, algorithm = "AES-256-GCM") {
    switch (algorithm) {
      case "AES-128-GCM":
        return this.decryptAESGCM(ciphertext, key, 128);
      case "AES-256-GCM":
        return this.decryptAESGCM(ciphertext, key, 256);
      case "AES-256-CBC":
        return this.decryptAESCBC(ciphertext, key);
      default:
        return this.decryptAESGCM(ciphertext, key, 256);
    }
  }

  // ==========================================
  // Key Material Protection (for storage)
  // ==========================================
  
  async encryptKeyMaterial(keyMaterial) {
    // Use environment variable or generate master key
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || 
      crypto.createHash("sha256").update("default-dev-key-change-in-production").digest("hex");
    
    const result = await this.encryptAESGCM(keyMaterial, masterKey, 256);
    return result.ciphertext;
  }

  async decryptKeyMaterial(encryptedKeyMaterial) {
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || 
      crypto.createHash("sha256").update("default-dev-key-change-in-production").digest("hex");
    
    const result = await this.decryptAESGCM(encryptedKeyMaterial, masterKey, 256);
    return result.plaintext;
  }

  // ==========================================
  // HMAC Key Generation (alias)
  // ==========================================

  async generateHMACKey(algorithm = "HMAC-SHA256") {
    const keySize = algorithm.includes("512") ? 64 : 
                   algorithm.includes("384") ? 48 : 32;
    
    const hmacKey = crypto.randomBytes(keySize);
    
    return {
      hmacKey: hmacKey.toString("hex"),
      keySize: keySize * 8,
      algorithm,
      createdAt: new Date().toISOString()
    };
  }

  // ==========================================
  // Sign/Verify aliases for controller
  // ==========================================

  async signData(data, privateKey, algorithm = "RSA-4096") {
    const hashAlg = algorithm.includes("ECDSA") ? "SHA384" : "SHA256";
    const sign = crypto.createSign(hashAlg);
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, "base64");
  }

  async verifySignature(data, signature, publicKey, algorithm = "RSA-4096") {
    const hashAlg = algorithm.includes("ECDSA") ? "SHA384" : "SHA256";
    const verify = crypto.createVerify(hashAlg);
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, "base64");
  }

  // ==========================================
  // HMAC generation for controller
  // ==========================================

  async generateHMAC(data, key, algorithm = "HMAC-SHA256") {
    const hashAlg = algorithm.replace("HMAC-", "").toLowerCase();
    const hmac = crypto.createHmac(hashAlg, Buffer.from(key, "hex"));
    hmac.update(data);
    return hmac.digest("hex");
  }
}

module.exports = new EncryptionService();
