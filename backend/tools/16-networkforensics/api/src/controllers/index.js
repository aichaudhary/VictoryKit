/**
 * Controllers Index
 * Export all controllers for NetworkForensics
 */

const deviceController = require("./deviceController");
const alertController = require("./alertController");
const trafficController = require("./trafficController");
const dashboardController = require("./dashboardController");

module.exports = {
  deviceController,
  alertController,
  trafficController,
  dashboardController
};
