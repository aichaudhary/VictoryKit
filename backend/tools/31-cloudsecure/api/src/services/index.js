/**
 * Services Index
 * Export all CloudSecure services
 */

const awsScanner = require('./aws.scanner');
const azureScanner = require('./azure.scanner');
const gcpScanner = require('./gcp.scanner');
const complianceEngine = require('./compliance.engine');
const attackPathAnalyzer = require('./attackpath.analyzer');

module.exports = {
  awsScanner,
  azureScanner,
  gcpScanner,
  complianceEngine,
  attackPathAnalyzer
};
