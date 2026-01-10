/**
 * Services Index
 * Export all services for NetworkForensics
 */

const discoveryService = require("./discoveryService");
const alertService = require("./alertService");
const trafficService = require("./trafficService");
const snmpService = require("./snmpService");
const websocketService = require("./websocketService");

module.exports = {
  discoveryService,
  alertService,
  trafficService,
  snmpService,
  websocketService
};
