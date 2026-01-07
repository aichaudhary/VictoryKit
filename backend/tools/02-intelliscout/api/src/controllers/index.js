const axios = require('axios');
const {
  ThreatIntelligence,
  IOC,
  ThreatActor,
  Campaign,
  ThreatFeed,
  VulnerabilityIntel,
  TTPMapping,
  ThreatReport
} = require('../models');

/**
 * IntelliScout API Controllers
 * Cyber Threat Intelligence Platform
 */

// ===== System Status =====
exports.getStatus = async (req, res) => {
  try {
    const status = {
      service: 'IntelliScout',
      status: 'operational',
      timestamp: new Date(),
      version: '1.0.0',
      database: 'connected',
      features: [
        'Threat Intelligence Aggregation',
        'IOC Detection & Enrichment',
        'Threat Actor Profiling',
        'Campaign Tracking',
        'Threat Feed Management',
        'Vulnerability Intelligence',
        'MITRE ATT&CK TTP Mapping',
        'Threat Reporting'
      ],
      feeds: {
        active: await ThreatFeed.countDocuments({ status: 'active' }),
        total: await ThreatFeed.countDocuments()
      },
      iocs: {
        total: await IOC.countDocuments(),
        active: await IOC.countDocuments({ status: 'active' })
      }
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Threat Intelligence =====
exports.createIntelligence = async (req, res) => {
  try {
    const intel = new ThreatIntelligence({
      intelId: `INTEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await intel.save();
    
    res.json({
      success: true,
      intelligence: intel
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIntelligence = async (req, res) => {
  try {
    const { type, severity, tlp, source, status } = req.query;
    
    const query = {};
    if (type) query.intelType = type;
    if (severity) query['assessment.severity'] = severity;
    if (tlp) query.tlp = tlp;
    if (source) query['source.name'] = source;
    if (status) query.status = status;
    
    const intelligence = await ThreatIntelligence.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: intelligence.length,
      intelligence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIntelligenceById = async (req, res) => {
  try {
    const { intelId } = req.params;
    
    const intel = await ThreatIntelligence.findOne({ intelId });
    if (!intel) {
      return res.status(404).json({ error: 'Intelligence not found' });
    }
    
    res.json({
      success: true,
      intelligence: intel
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchIntelligence = async (req, res) => {
  try {
    const { q, type, dateFrom, dateTo } = req.query;
    
    const query = {};
    
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [q] } }
      ];
    }
    
    if (type) query.intelType = type;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    const results = await ThreatIntelligence.find(query)
      .sort({ 'assessment.severity': -1, createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== IOC Management =====
exports.createIOC = async (req, res) => {
  try {
    const ioc = new IOC({
      iocId: `IOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await ioc.calculateThreatScore();
    await ioc.save();
    
    res.json({
      success: true,
      ioc
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIOCs = async (req, res) => {
  try {
    const { type, status, severity, source } = req.query;
    
    const query = {};
    if (type) query.iocType = type;
    if (status) query.status = status;
    if (severity) query['assessment.severity'] = severity;
    if (source) query['source.name'] = source;
    
    const iocs = await IOC.find(query)
      .sort({ 'assessment.threatScore': -1, createdAt: -1 })
      .limit(200);
    
    res.json({
      success: true,
      count: iocs.length,
      iocs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.enrichIOC = async (req, res) => {
  try {
    const { iocId } = req.params;
    const { source, data } = req.body;
    
    const ioc = await IOC.findOne({ iocId });
    if (!ioc) {
      return res.status(404).json({ error: 'IOC not found' });
    }
    
    await ioc.addEnrichment(source, data);
    
    res.json({
      success: true,
      ioc
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bulkImportIOCs = async (req, res) => {
  try {
    const { iocs, source, tlp } = req.body;
    
    const imported = [];
    for (const iocData of iocs) {
      const ioc = new IOC({
        iocId: `IOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...iocData,
        source: source || iocData.source,
        tlp: tlp || iocData.tlp || 'amber'
      });
      
      await ioc.calculateThreatScore();
      await ioc.save();
      imported.push(ioc);
    }
    
    res.json({
      success: true,
      imported: imported.length,
      iocs: imported
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getIOCStats = async (req, res) => {
  try {
    const stats = await IOC.getStatistics();
    const highThreat = await IOC.findHighThreat();
    const recentlyActive = await IOC.findRecentlyActive(7);
    
    res.json({
      success: true,
      stats,
      highThreatCount: highThreat.length,
      recentlyActiveCount: recentlyActive.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Threat Actor Management =====
exports.createThreatActor = async (req, res) => {
  try {
    const actor = new ThreatActor({
      actorId: `ACTOR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await actor.save();
    
    res.json({
      success: true,
      actor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getThreatActors = async (req, res) => {
  try {
    const { type, sophistication, motivation, region, status } = req.query;
    
    const query = {};
    if (type) query.actorType = type;
    if (sophistication) query['profile.sophisticationLevel'] = sophistication;
    if (motivation) query['profile.motivations'] = motivation;
    if (region) query['profile.operatingRegions'] = region;
    if (status) query.status = status;
    
    const actors = await ThreatActor.find(query)
      .sort({ threatLevel: -1, updatedAt: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: actors.length,
      actors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getThreatActorById = async (req, res) => {
  try {
    const { actorId } = req.params;
    
    const actor = await ThreatActor.findOne({ actorId });
    if (!actor) {
      return res.status(404).json({ error: 'Threat actor not found' });
    }
    
    res.json({
      success: true,
      actor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.linkActorToCampaign = async (req, res) => {
  try {
    const { actorId } = req.params;
    const { campaignId, role, confidence, evidence } = req.body;
    
    const actor = await ThreatActor.findOne({ actorId });
    if (!actor) {
      return res.status(404).json({ error: 'Threat actor not found' });
    }
    
    await actor.addCampaign(campaignId, role, confidence, evidence);
    
    res.json({
      success: true,
      actor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Campaign Management =====
exports.createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign({
      campaignId: `CAMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await campaign.save();
    
    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const { status, targetSector, actorId, severity } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (targetSector) query['targets.sectors'] = targetSector;
    if (actorId) query['attribution.primaryActor'] = actorId;
    if (severity) query['impact.severity'] = severity;
    
    const campaigns = await Campaign.find(query)
      .sort({ 'timeline.firstSeen': -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCampaignById = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await Campaign.findOne({ campaignId });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({
      success: true,
      campaign
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.findActive();
    
    res.json({
      success: true,
      count: campaigns.length,
      campaigns
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Threat Feed Management =====
exports.createFeed = async (req, res) => {
  try {
    const feed = new ThreatFeed({
      feedId: `FEED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await feed.save();
    
    res.json({
      success: true,
      feed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeeds = async (req, res) => {
  try {
    const { type, status, provider } = req.query;
    
    const query = {};
    if (type) query.feedType = type;
    if (status) query.status = status;
    if (provider) query['provider.name'] = provider;
    
    const feeds = await ThreatFeed.find(query)
      .sort({ 'quality.overallScore': -1 });
    
    res.json({
      success: true,
      count: feeds.length,
      feeds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.syncFeed = async (req, res) => {
  try {
    const { feedId } = req.params;
    
    const feed = await ThreatFeed.findOne({ feedId });
    if (!feed) {
      return res.status(404).json({ error: 'Feed not found' });
    }
    
    // Simulate feed sync
    const syncResult = {
      newIndicators: Math.floor(Math.random() * 100),
      updatedIndicators: Math.floor(Math.random() * 50),
      removedIndicators: Math.floor(Math.random() * 10)
    };
    
    await feed.recordSync(syncResult.newIndicators, syncResult.updatedIndicators, syncResult.removedIndicators);
    
    res.json({
      success: true,
      syncResult,
      feed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFeedStats = async (req, res) => {
  try {
    const stats = await ThreatFeed.getStatistics();
    const dueForSync = await ThreatFeed.findDueForSync();
    
    res.json({
      success: true,
      stats,
      dueForSyncCount: dueForSync.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Vulnerability Intelligence =====
exports.createVulnerability = async (req, res) => {
  try {
    const vuln = new VulnerabilityIntel({
      vulnId: `VULN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await vuln.save();
    
    res.json({
      success: true,
      vulnerability: vuln
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVulnerabilities = async (req, res) => {
  try {
    const { severity, exploitStatus, vendor, status } = req.query;
    
    const query = {};
    if (severity) query['scoring.severity'] = severity;
    if (exploitStatus) query['exploitation.exploitAvailable'] = exploitStatus === 'true';
    if (vendor) query['affectedProducts.vendor'] = vendor;
    if (status) query.status = status;
    
    const vulnerabilities = await VulnerabilityIntel.find(query)
      .sort({ 'scoring.cvssScore': -1, publishedDate: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: vulnerabilities.length,
      vulnerabilities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCriticalVulnerabilities = async (req, res) => {
  try {
    const critical = await VulnerabilityIntel.findCritical();
    const exploited = await VulnerabilityIntel.findActivelyExploited();
    
    res.json({
      success: true,
      critical,
      activelyExploited: exploited
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== TTP Mapping =====
exports.createTTP = async (req, res) => {
  try {
    const ttp = new TTPMapping({
      ttpId: `TTP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await ttp.save();
    
    res.json({
      success: true,
      ttp
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTTPs = async (req, res) => {
  try {
    const { tactic, platform, actorId, severity } = req.query;
    
    const query = {};
    if (tactic) query['mitre.tactic'] = tactic;
    if (platform) query['mitre.platforms'] = platform;
    if (actorId) query['actors.actorId'] = actorId;
    if (severity) query['assessment.severity'] = severity;
    
    const ttps = await TTPMapping.find(query)
      .sort({ 'usage.prevalence': -1 });
    
    res.json({
      success: true,
      count: ttps.length,
      ttps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTTPsByTactic = async (req, res) => {
  try {
    const { tactic } = req.params;
    
    const ttps = await TTPMapping.findByTactic(tactic);
    
    res.json({
      success: true,
      tactic,
      count: ttps.length,
      ttps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMitreMatrix = async (req, res) => {
  try {
    const matrix = await TTPMapping.getMitreMatrix();
    
    res.json({
      success: true,
      matrix
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Threat Reports =====
exports.createReport = async (req, res) => {
  try {
    const report = new ThreatReport({
      reportId: `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body
    });
    
    await report.save();
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { type, status, tlp, severity } = req.query;
    
    const query = {};
    if (type) query.reportType = type;
    if (status) query.status = status;
    if (tlp) query.tlp = tlp;
    if (severity) query['assessment.overallSeverity'] = severity;
    
    const reports = await ThreatReport.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await ThreatReport.findOne({ reportId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.publishReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { user } = req.body;
    
    const report = await ThreatReport.findOne({ reportId });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    await report.publish(user);
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Dashboard & Analytics =====
exports.getDashboard = async (req, res) => {
  try {
    const [
      intelCount,
      iocCount,
      actorCount,
      campaignCount,
      feedCount,
      vulnCount,
      ttpCount,
      reportCount
    ] = await Promise.all([
      ThreatIntelligence.countDocuments(),
      IOC.countDocuments({ status: 'active' }),
      ThreatActor.countDocuments({ status: 'active' }),
      Campaign.countDocuments({ status: 'active' }),
      ThreatFeed.countDocuments({ status: 'active' }),
      VulnerabilityIntel.countDocuments({ status: 'active' }),
      TTPMapping.countDocuments(),
      ThreatReport.countDocuments({ status: 'published' })
    ]);
    
    const recentIntel = await ThreatIntelligence.find()
      .sort({ createdAt: -1 })
      .limit(10);
    
    const highThreatIOCs = await IOC.findHighThreat();
    const activeCampaigns = await Campaign.findActive();
    const criticalVulns = await VulnerabilityIntel.findCritical();
    
    res.json({
      success: true,
      stats: {
        intelligence: intelCount,
        iocs: iocCount,
        threatActors: actorCount,
        campaigns: campaignCount,
        feeds: feedCount,
        vulnerabilities: vulnCount,
        ttps: ttpCount,
        reports: reportCount
      },
      recentIntelligence: recentIntel,
      highThreatIOCs: highThreatIOCs.slice(0, 10),
      activeCampaigns: activeCampaigns.slice(0, 5),
      criticalVulnerabilities: criticalVulns.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== Configuration =====
exports.getConfig = async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, '../../../../frontend/tools/02-intelliscout/intelliscout-config.json');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      res.json({ success: true, config });
    } else {
      res.json({ success: true, config: null, message: 'Config file not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
