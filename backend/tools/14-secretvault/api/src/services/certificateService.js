/**
 * Certificate Service
 * Certificate Authority integrations and certificate lifecycle management
 */

const axios = require("axios");
const crypto = require("crypto");
const forge = require("node-forge");

class CertificateService {
  constructor() {
    this.providers = {
      letsencrypt: this.letsencryptConfig(),
      digicert: this.digicertConfig(),
      sectigo: this.sectigoConfig(),
      globalsign: this.globalsignConfig(),
      venafi: this.venafiConfig()
    };
  }

  letsencryptConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_LETSENCRYPT_EMAIL,
      email: process.env.ENCRYPTIONMANAGER_LETSENCRYPT_EMAIL,
      acmeUrl: process.env.ENCRYPTIONMANAGER_LETSENCRYPT_ACME_URL || "https://acme-v02.api.letsencrypt.org/directory",
      accountKey: process.env.ENCRYPTIONMANAGER_LETSENCRYPT_ACCOUNT_KEY
    };
  }

  digicertConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_DIGICERT_API_KEY,
      apiKey: process.env.ENCRYPTIONMANAGER_DIGICERT_API_KEY,
      orgId: process.env.ENCRYPTIONMANAGER_DIGICERT_ORG_ID,
      endpoint: process.env.ENCRYPTIONMANAGER_DIGICERT_ENDPOINT || "https://www.digicert.com/services/v2"
    };
  }

  sectigoConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_SECTIGO_LOGIN_NAME,
      loginName: process.env.ENCRYPTIONMANAGER_SECTIGO_LOGIN_NAME,
      loginPassword: process.env.ENCRYPTIONMANAGER_SECTIGO_LOGIN_PASSWORD,
      customerUri: process.env.ENCRYPTIONMANAGER_SECTIGO_CUSTOMER_URI,
      endpoint: process.env.ENCRYPTIONMANAGER_SECTIGO_ENDPOINT
    };
  }

  globalsignConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_GLOBALSIGN_API_KEY,
      apiKey: process.env.ENCRYPTIONMANAGER_GLOBALSIGN_API_KEY,
      apiSecret: process.env.ENCRYPTIONMANAGER_GLOBALSIGN_API_SECRET,
      endpoint: process.env.ENCRYPTIONMANAGER_GLOBALSIGN_ENDPOINT
    };
  }

  venafiConfig() {
    return {
      enabled: !!process.env.ENCRYPTIONMANAGER_VENAFI_URL,
      url: process.env.ENCRYPTIONMANAGER_VENAFI_URL,
      username: process.env.ENCRYPTIONMANAGER_VENAFI_USERNAME,
      password: process.env.ENCRYPTIONMANAGER_VENAFI_PASSWORD,
      policyFolder: process.env.ENCRYPTIONMANAGER_VENAFI_POLICY_FOLDER
    };
  }

  getAvailableProviders() {
    return Object.entries(this.providers)
      .filter(([_, config]) => config.enabled)
      .map(([name]) => name);
  }

  // ==========================================
  // Certificate Generation
  // ==========================================
  
  async generateSelfSignedCertificate(options) {
    const {
      commonName,
      organization = "VictoryKit",
      country = "US",
      validityDays = 365,
      keyAlgorithm = "RSA-2048",
      subjectAlternativeNames = []
    } = options;

    // Generate key pair
    const keySize = parseInt(keyAlgorithm.split("-")[1]) || 2048;
    const keys = forge.pki.rsa.generateKeyPair(keySize);

    // Create certificate
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = crypto.randomBytes(16).toString("hex");
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + validityDays);

    const attrs = [
      { name: "commonName", value: commonName },
      { name: "organizationName", value: organization },
      { name: "countryName", value: country }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // Add extensions
    const extensions = [
      { name: "basicConstraints", cA: false },
      { name: "keyUsage", keyCertSign: false, digitalSignature: true, keyEncipherment: true },
      { name: "extKeyUsage", serverAuth: true, clientAuth: true }
    ];

    if (subjectAlternativeNames.length > 0) {
      extensions.push({
        name: "subjectAltName",
        altNames: subjectAlternativeNames.map(name => {
          if (name.startsWith("*.") || !name.includes("@")) {
            return { type: 2, value: name }; // DNS name
          }
          return { type: 1, value: name }; // Email
        })
      });
    }

    cert.setExtensions(extensions);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const certPem = forge.pki.certificateToPem(cert);
    const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

    return {
      certificate: certPem,
      privateKey: keyPem,
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
      serialNumber: cert.serialNumber,
      fingerprint: {
        sha256: this.getCertificateFingerprint(certPem, "sha256"),
        sha1: this.getCertificateFingerprint(certPem, "sha1")
      },
      validFrom: cert.validity.notBefore,
      validTo: cert.validity.notAfter,
      subject: { commonName, organization, country },
      selfSigned: true
    };
  }

  async generateCSR(options) {
    const {
      commonName,
      organization = "VictoryKit",
      organizationalUnit = "",
      locality = "",
      state = "",
      country = "US",
      keyAlgorithm = "RSA-2048",
      subjectAlternativeNames = []
    } = options;

    const keySize = parseInt(keyAlgorithm.split("-")[1]) || 2048;
    const keys = forge.pki.rsa.generateKeyPair(keySize);

    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;

    const attrs = [
      { name: "commonName", value: commonName },
      { name: "organizationName", value: organization },
      { name: "countryName", value: country }
    ];

    if (organizationalUnit) attrs.push({ name: "organizationalUnitName", value: organizationalUnit });
    if (locality) attrs.push({ name: "localityName", value: locality });
    if (state) attrs.push({ name: "stateOrProvinceName", value: state });

    csr.setSubject(attrs);

    if (subjectAlternativeNames.length > 0) {
      csr.setAttributes([{
        name: "extensionRequest",
        extensions: [{
          name: "subjectAltName",
          altNames: subjectAlternativeNames.map(name => ({ type: 2, value: name }))
        }]
      }]);
    }

    csr.sign(keys.privateKey, forge.md.sha256.create());

    return {
      csr: forge.pki.certificationRequestToPem(csr),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      publicKey: forge.pki.publicKeyToPem(keys.publicKey)
    };
  }

  // ==========================================
  // CA Provider Integration
  // ==========================================
  
  async requestCertificateFromCA(provider, csrPem, options) {
    const config = this.providers[provider];
    
    if (!config?.enabled) {
      console.log(`[Certificate] Provider ${provider} not configured, using simulation`);
      return this.simulateCertificateIssuance(provider, options);
    }

    switch (provider) {
      case "digicert":
        return this.requestDigicertCertificate(csrPem, options);
      case "letsencrypt":
        return this.requestLetsEncryptCertificate(options);
      case "venafi":
        return this.requestVenafiCertificate(csrPem, options);
      default:
        return this.simulateCertificateIssuance(provider, options);
    }
  }

  async requestDigicertCertificate(csrPem, options) {
    const config = this.providers.digicert;
    
    try {
      const response = await axios.post(
        `${config.endpoint}/order/certificate/ssl_plus`,
        {
          certificate: {
            common_name: options.commonName,
            csr: csrPem,
            server_platform: { id: -1 },
            signature_hash: "sha256"
          },
          organization: { id: config.orgId },
          validity_years: options.validityYears || 1
        },
        {
          headers: {
            "X-DC-DEVKEY": config.apiKey,
            "Content-Type": "application/json"
          }
        }
      );

      return {
        orderId: response.data.id,
        status: "pending",
        provider: "digicert"
      };
    } catch (error) {
      console.error("[DigiCert] Certificate request failed:", error.message);
      return this.simulateCertificateIssuance("digicert", options);
    }
  }

  async requestLetsEncryptCertificate(options) {
    // Let's Encrypt ACME integration would be more complex
    // Requires domain validation challenges
    console.log("[Let's Encrypt] Certificate request (simulated)");
    return this.simulateCertificateIssuance("letsencrypt", options);
  }

  async requestVenafiCertificate(csrPem, options) {
    const config = this.providers.venafi;
    
    try {
      // Get auth token
      const authResponse = await axios.post(
        `${config.url}/authorize/`,
        {
          Username: config.username,
          Password: config.password
        }
      );

      const token = authResponse.data.APIKey;

      // Request certificate
      const response = await axios.post(
        `${config.url}/certificates/request`,
        {
          PolicyDN: config.policyFolder,
          PKCS10: csrPem,
          ObjectName: options.commonName,
          CertificateType: "Server"
        },
        {
          headers: { "X-Venafi-Api-Key": token }
        }
      );

      return {
        requestId: response.data.CertificateDN,
        status: "pending",
        provider: "venafi"
      };
    } catch (error) {
      console.error("[Venafi] Certificate request failed:", error.message);
      return this.simulateCertificateIssuance("venafi", options);
    }
  }

  simulateCertificateIssuance(provider, options) {
    return {
      requestId: `${provider}-${crypto.randomBytes(8).toString("hex")}`,
      status: "simulated",
      provider,
      commonName: options.commonName,
      estimatedIssuance: new Date(Date.now() + 3600000).toISOString(),
      simulated: true
    };
  }

  // ==========================================
  // Certificate Utilities
  // ==========================================
  
  getCertificateFingerprint(certPem, algorithm = "sha256") {
    const cert = forge.pki.certificateFromPem(certPem);
    const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();
    const md = algorithm === "sha1" ? forge.md.sha1.create() : forge.md.sha256.create();
    md.update(der);
    return md.digest().toHex().match(/.{2}/g).join(":").toUpperCase();
  }

  parseCertificate(certPem) {
    try {
      const cert = forge.pki.certificateFromPem(certPem);
      
      return {
        serialNumber: cert.serialNumber,
        subject: this.extractDNAttributes(cert.subject.attributes),
        issuer: this.extractDNAttributes(cert.issuer.attributes),
        validFrom: cert.validity.notBefore,
        validTo: cert.validity.notAfter,
        fingerprint: {
          sha256: this.getCertificateFingerprint(certPem, "sha256"),
          sha1: this.getCertificateFingerprint(certPem, "sha1")
        },
        keyAlgorithm: cert.publicKey.n ? `RSA-${cert.publicKey.n.bitLength()}` : "Unknown",
        signatureAlgorithm: forge.pki.oids[cert.signatureOid] || cert.signatureOid,
        extensions: this.extractExtensions(cert.extensions)
      };
    } catch (error) {
      throw new Error(`Failed to parse certificate: ${error.message}`);
    }
  }

  extractDNAttributes(attributes) {
    const result = {};
    for (const attr of attributes) {
      result[attr.name || attr.shortName] = attr.value;
    }
    return result;
  }

  extractExtensions(extensions) {
    const result = {};
    for (const ext of extensions || []) {
      result[ext.name] = ext;
    }
    return result;
  }

  async checkCertificateExpiry(certPem) {
    const parsed = this.parseCertificate(certPem);
    const now = new Date();
    const expiryDate = new Date(parsed.validTo);
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    return {
      isExpired: now > expiryDate,
      daysUntilExpiry,
      expiryDate: expiryDate.toISOString(),
      status: daysUntilExpiry < 0 ? "expired" : 
              daysUntilExpiry < 7 ? "critical" :
              daysUntilExpiry < 30 ? "warning" : "valid"
    };
  }

  async checkCertificateTransparency(domain) {
    try {
      const response = await axios.get(
        `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`,
        { timeout: 10000 }
      );
      
      return {
        domain,
        certificates: response.data.slice(0, 20).map(cert => ({
          id: cert.id,
          issuer: cert.issuer_name,
          commonName: cert.common_name,
          notBefore: cert.not_before,
          notAfter: cert.not_after,
          serialNumber: cert.serial_number
        })),
        source: "crt.sh"
      };
    } catch (error) {
      return {
        domain,
        certificates: [],
        error: error.message,
        simulated: true
      };
    }
  }
}

module.exports = new CertificateService();
