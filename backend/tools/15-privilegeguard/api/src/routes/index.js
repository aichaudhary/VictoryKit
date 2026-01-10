/**
 * PrivilegeGuard API - Routes
 */

const express = require("express");
const router = express.Router();

const keyController = require("../controllers/keyController");
const certificateController = require("../controllers/certificateController");
const secretController = require("../controllers/secretController");
const vaultController = require("../controllers/vaultController");

// Key routes
router.get("/keys", keyController.getAll);
router.get("/keys/:id", keyController.getById);
router.post("/keys", keyController.create);
router.put("/keys/:id", keyController.update);
router.delete("/keys/:id", keyController.delete);
router.post("/keys/:id/rotate", keyController.rotate);
router.post("/keys/:id/analyze", keyController.analyze);
router.get("/keys/:id/usage", keyController.getUsage);
router.post("/keys/encrypt", keyController.encrypt);
router.post("/keys/decrypt", keyController.decrypt);

// Certificate routes
router.get("/certificates", certificateController.getAll);
router.get("/certificates/:id", certificateController.getById);
router.post("/certificates", certificateController.create);
router.put("/certificates/:id", certificateController.update);
router.delete("/certificates/:id", certificateController.delete);
router.post("/certificates/:id/renew", certificateController.renew);
router.post("/certificates/:id/validate", certificateController.validate);
router.get("/certificates/expiring", certificateController.getExpiring);

// Secret routes
router.get("/secrets", secretController.getAll);
router.get("/secrets/:id", secretController.getById);
router.post("/secrets", secretController.create);
router.put("/secrets/:id", secretController.update);
router.delete("/secrets/:id", secretController.delete);
router.post("/secrets/:id/rotate", secretController.rotate);
router.get("/secrets/:id/versions", secretController.getVersions);
router.post("/secrets/:id/analyze", secretController.analyze);

// Vault routes
router.get("/vaults", vaultController.getAll);
router.get("/vaults/:id", vaultController.getById);
router.post("/vaults", vaultController.create);
router.put("/vaults/:id", vaultController.update);
router.delete("/vaults/:id", vaultController.delete);
router.get("/vaults/:id/audit", vaultController.getAuditLog);
router.get("/vaults/:id/dashboard", vaultController.getDashboard);

module.exports = router;
