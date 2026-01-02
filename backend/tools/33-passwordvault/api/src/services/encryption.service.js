const crypto = require('crypto');
const forge = require('node-forge');

class EncryptionService {
  constructor() {
    this.algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
  }

  /**
   * Generate a new encryption key
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(data, key) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, key);
      cipher.setAAD(Buffer.from('passwordvault'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.algorithm
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encryptedData, key, iv, tag) {
    try {
      const decipher = crypto.createDecipher(this.algorithm, key);
      decipher.setAAD(Buffer.from('passwordvault'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password, hash) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random password
   */
  generatePassword(options = {}) {
    const {
      length = 16,
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true
    } = options;

    let charset = '';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
      throw new Error('At least one character type must be enabled');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }

    return password;
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else feedback.push('Password should be at least 12 characters long');

    // Character variety
    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 15;
    else feedback.push('Include numbers');

    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 20;
    else feedback.push('Include special characters');

    // Common patterns
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      feedback.push('Avoid repeated characters');
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      score -= 15;
      feedback.push('Avoid common patterns');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      strength: score >= 80 ? 'strong' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'weak',
      feedback
    };
  }

  /**
   * Generate RSA key pair for digital signatures
   */
  generateRSAKeyPair() {
    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keypair) => {
        if (err) return reject(err);

        const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);
        const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);

        resolve({ privateKey, publicKey });
      });
    });
  }

  /**
   * Sign data with RSA private key
   */
  signData(data, privateKey) {
    const pki = forge.pki;
    const key = pki.privateKeyFromPem(privateKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    const signature = key.sign(md);
    return forge.util.encode64(signature);
  }

  /**
   * Verify data signature with RSA public key
   */
  verifySignature(data, signature, publicKey) {
    const pki = forge.pki;
    const key = pki.publicKeyFromPem(publicKey);
    const md = forge.md.sha256.create();
    md.update(data, 'utf8');
    return key.verify(md.digest().bytes(), forge.util.decode64(signature));
  }

  /**
   * Generate HMAC for data integrity
   */
  generateHMAC(data, key) {
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHMAC(data, hmac, key) {
    const expected = this.generateHMAC(data, key);
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'));
  }
}

module.exports = new EncryptionService();