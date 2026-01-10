/**
 * Certificate Controller
 * Handles certificate management operations
 */

const { Certificate } = require("../models");
const { certificateService, auditService, websocketService } = require("../services");

// Get all certificates
exports.getCertificates = async (req, res) => {
  try {
    const { status, provider, domain, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    if (domain) filter.domains = { $in: [domain] };

    const certificates = await Certificate.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Certificate.countDocuments(filter);

    res.json({
      success: true,
      data: certificates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single certificate
exports.getCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }

    await auditService.log({
      operation: "cert.read",
      resourceType: "certificate",
      resourceId: cert._id,
      resourceName: cert.domains[0],
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
    });

    res.json({ success: true, data: cert });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Request new certificate
exports.requestCertificate = async (req, res) => {
  try {
    const { domains, provider = "letsencrypt", keyType = "RSA-2048" } = req.body;

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one domain is required",
      });
    }

    // Check for existing certificate for same domains
    const existing = await Certificate.findOne({
      domains: { $all: domains },
      status: { $in: ["valid", "pending"] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Certificate already exists for these domains",
      });
    }

    // Create certificate request
    const cert = new Certificate({
      domains,
      provider,
      keyType,
      status: "pending",
      requestedAt: new Date(),
    });

    await cert.save();

    // Trigger certificate issuance (async)
    certificateService
      .requestCertificate({ domains, provider, keyType, certId: cert._id })
      .catch((err) => console.error("Certificate request error:", err));

    await auditService.log({
      operation: "cert.create",
      resourceType: "certificate",
      resourceId: cert._id,
      resourceName: domains[0],
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      cryptoDetails: { domains, provider },
    });

    websocketService.broadcast("certificate-requested", {
      certId: cert._id,
      domains,
      status: "pending",
    });

    res.status(202).json({
      success: true,
      data: cert,
      message: "Certificate request submitted",
    });
  } catch (error) {
    console.error("Certificate request error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Renew certificate
exports.renewCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }

    cert.status = "renewing";
    cert.renewalRequestedAt = new Date();
    await cert.save();

    // Trigger renewal (async)
    certificateService
      .renewCertificate({ certId: cert._id })
      .catch((err) => console.error("Certificate renewal error:", err));

    await auditService.log({
      operation: "cert.renew",
      resourceType: "certificate",
      resourceId: cert._id,
      resourceName: cert.domains[0],
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
    });

    websocketService.broadcast("certificate-renewal", {
      certId: cert._id,
      domains: cert.domains,
      status: "renewing",
    });

    res.json({
      success: true,
      data: cert,
      message: "Certificate renewal initiated",
    });
  } catch (error) {
    console.error("Certificate renewal error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Revoke certificate
exports.revokeCertificate = async (req, res) => {
  try {
    const { reason } = req.body;
    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }

    cert.status = "revoked";
    cert.revokedAt = new Date();
    cert.revocationReason = reason || "unspecified";
    await cert.save();

    // Notify provider of revocation
    certificateService
      .revokeCertificate({ certId: cert._id, reason })
      .catch((err) => console.error("Certificate revocation error:", err));

    await auditService.log({
      operation: "cert.revoke",
      resourceType: "certificate",
      resourceId: cert._id,
      resourceName: cert.domains[0],
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
      changes: { reason },
    });

    websocketService.broadcast("certificate-revoked", {
      certId: cert._id,
      domains: cert.domains,
    });

    res.json({
      success: true,
      data: cert,
      message: "Certificate revoked",
    });
  } catch (error) {
    console.error("Certificate revocation error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }

    await Certificate.findByIdAndDelete(req.params.id);

    await auditService.log({
      operation: "cert.delete",
      resourceType: "certificate",
      resourceId: cert._id,
      resourceName: cert.domains[0],
      actor: { userId: req.user?.id || "system", serviceAccount: !req.user },
    });

    res.json({ success: true, message: "Certificate deleted" });
  } catch (error) {
    console.error("Certificate deletion error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify certificate
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
      return res.status(404).json({ success: false, error: "Certificate not found" });
    }

    const verification = await certificateService.verifyCertificate(cert);

    res.json({
      success: true,
      data: {
        certId: cert._id,
        domains: cert.domains,
        verification,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
