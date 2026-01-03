/**
 * Controllers Index
 * EncryptionManager API
 */

const keyController = require("./keyController");
const encryptionController = require("./encryptionController");
const dashboardController = require("./dashboardController");
const auditController = require("./auditController");
const certificateController = require("./certificateController");

module.exports = {
  keyController,
  encryptionController,
  dashboardController,
  auditController,
  certificateController,
};
