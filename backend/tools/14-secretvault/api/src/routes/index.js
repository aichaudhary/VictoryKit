/**
 * SecretVault API Routes
 * Tool 14 - Key Management & Data Encryption
 */

const express = require("express");
const router = express.Router();

const {
  keyController,
  encryptionController,
  dashboardController,
  auditController,
  certificateController,
} = require("../controllers");

const { validateKeyCreation, validateEncryption, validateDecryption } = require("../middleware");

// ============= DASHBOARD ROUTES =============
router.get("/dashboard", dashboardController.getDashboard);
router.get("/health-report", dashboardController.getHealthReport);
router.get("/metrics", dashboardController.getMetrics);

// ============= KEY MANAGEMENT ROUTES =============
router.get("/keys", keyController.getKeys);
router.get("/keys/:id", keyController.getKey);
router.post("/keys", validateKeyCreation, keyController.createKey);
router.post("/keys/:id/rotate", keyController.rotateKey);
router.patch("/keys/:id/status", keyController.updateKeyStatus);
router.delete("/keys/:id", keyController.deleteKey);
router.get("/keys/:id/stats", keyController.getKeyStats);

// ============= ENCRYPTION OPERATIONS =============
router.post("/encrypt", validateEncryption, encryptionController.encrypt);
router.post("/decrypt", validateDecryption, encryptionController.decrypt);
router.post("/sign", encryptionController.sign);
router.post("/verify", encryptionController.verify);
router.post("/hmac", encryptionController.generateHMAC);
router.post("/hmac/verify", encryptionController.verifyHMAC);

// ============= CERTIFICATE ROUTES =============
router.get("/certificates", certificateController.getCertificates);
router.get("/certificates/:id", certificateController.getCertificate);
router.post("/certificates", certificateController.requestCertificate);
router.post("/certificates/:id/renew", certificateController.renewCertificate);
router.post("/certificates/:id/revoke", certificateController.revokeCertificate);
router.delete("/certificates/:id", certificateController.deleteCertificate);
router.post("/certificates/:id/verify", certificateController.verifyCertificate);

// ============= AUDIT ROUTES =============
router.get("/audit", auditController.getAuditLogs);
router.get("/audit/:id", auditController.getAuditLog);
router.get("/audit/compliance/report", auditController.getComplianceReport);
router.get("/audit/export", auditController.exportAuditLogs);

module.exports = router;
