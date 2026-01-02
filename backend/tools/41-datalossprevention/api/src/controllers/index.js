/**
 * Controllers Index
 */

module.exports = {
  scan: require('./scanController'),
  policy: require('./policyController'),
  incident: require('./incidentController'),
  classification: require('./classificationController'),
  endpoint: require('./endpointController'),
  integration: require('./integrationController')
};
