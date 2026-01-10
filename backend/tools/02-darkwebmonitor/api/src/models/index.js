/**
 * DarkWebMonitor - Models Index
 * Exports all threat intelligence models
 */

const ThreatIntelligence = require('./ThreatIntelligence');
const IOC = require('./IOC');
const ThreatActor = require('./ThreatActor');
const Campaign = require('./Campaign');
const ThreatFeed = require('./ThreatFeed');
const VulnerabilityIntel = require('./VulnerabilityIntel');
const TTPMapping = require('./TTPMapping');
const ThreatReport = require('./ThreatReport');

module.exports = {
  ThreatIntelligence,
  IOC,
  ThreatActor,
  Campaign,
  ThreatFeed,
  VulnerabilityIntel,
  TTPMapping,
  ThreatReport
};
