/**
 * PrivacyShield Models - Data Privacy Protection Platform
 * Centralized export for all MongoDB models
 */

const PIIRecord = require('./PIIRecord');
const PrivacyPolicy = require('./PrivacyPolicy');
const CookieConsent = require('./CookieConsent');
const DataMapping = require('./DataMapping');
const PrivacyAssessment = require('./PrivacyAssessment');
const PrivacyRights = require('./PrivacyRights');
const ThirdPartyTracker = require('./ThirdPartyTracker');
const ComplianceReport = require('./ComplianceReport');

module.exports = {
  PIIRecord,
  PrivacyPolicy,
  CookieConsent,
  DataMapping,
  PrivacyAssessment,
  PrivacyRights,
  ThirdPartyTracker,
  ComplianceReport
};
