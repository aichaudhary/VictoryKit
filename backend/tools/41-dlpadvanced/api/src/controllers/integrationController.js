/**
 * Integration Controller - Cloud & External System Integrations
 */

/**
 * Get integration status
 */
exports.getStatus = async (req, res) => {
  try {
    const integrations = require('../services/index');
    const status = await integrations.checkIntegrationStatus();
    
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// Microsoft 365
// ==========================================

exports.scanOneDrive = async (req, res) => {
  try {
    const { userId, siteId, driveId } = req.body;
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    let result;
    if (siteId || driveId) {
      result = await integrations.microsoft365.scanSharePointDrive(siteId, driveId, dlpService);
    } else if (userId) {
      result = await integrations.microsoft365.scanOneDriveFiles(userId, dlpService);
    } else {
      return res.status(400).json({ success: false, error: 'userId, siteId, or driveId required' });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanTeams = async (req, res) => {
  try {
    const { teamId, channelId, options } = req.body;
    
    if (!teamId || !channelId) {
      return res.status(400).json({ success: false, error: 'teamId and channelId required' });
    }
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.microsoft365.scanTeamsChannel(teamId, channelId, dlpService, options);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanOutlook = async (req, res) => {
  try {
    const { userId, folderId, options } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId required' });
    }
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.microsoft365.scanOutlookMailbox(userId, dlpService, { folderId, ...options });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// Google Workspace
// ==========================================

exports.scanGoogleDrive = async (req, res) => {
  try {
    const { userEmail, folderId, options } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'userEmail required' });
    }
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.googleWorkspace.scanDrive(userEmail, dlpService, { folderId, ...options });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanGmail = async (req, res) => {
  try {
    const { userEmail, labelIds, options } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'userEmail required' });
    }
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.googleWorkspace.scanGmail(userEmail, dlpService, { labelIds, ...options });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// Slack
// ==========================================

exports.getSlackChannels = async (req, res) => {
  try {
    const integrations = require('../services/index');
    const channels = await integrations.slack.listChannels();
    
    res.json({ success: true, data: channels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanSlackChannel = async (req, res) => {
  try {
    const { channelId, options } = req.body;
    
    if (!channelId) {
      return res.status(400).json({ success: false, error: 'channelId required' });
    }
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.slack.scanChannel(channelId, dlpService, options);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanSlackWorkspace = async (req, res) => {
  try {
    const { options } = req.body;
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.slack.scanWorkspace(dlpService, options);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// Cloud Storage (AWS S3, Azure, Dropbox, Box)
// ==========================================

exports.listS3Buckets = async (req, res) => {
  try {
    const integrations = require('../services/index');
    const buckets = await integrations.cloudStorage.listS3Buckets();
    
    res.json({ success: true, data: buckets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanS3Bucket = async (req, res) => {
  try {
    const { bucket, prefix, options } = req.body;
    
    if (!bucket) {
      return res.status(400).json({ success: false, error: 'bucket required' });
    }
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.cloudStorage.scanS3Bucket(bucket, dlpService, { prefix, ...options });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanAzureContainer = async (req, res) => {
  try {
    const { container, prefix, options } = req.body;
    
    if (!container) {
      return res.status(400).json({ success: false, error: 'container required' });
    }
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.cloudStorage.scanAzureContainer(container, dlpService, { prefix, ...options });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanDropbox = async (req, res) => {
  try {
    const { path, options } = req.body;
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.cloudStorage.scanDropbox(dlpService, { path, ...options });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanBox = async (req, res) => {
  try {
    const { folderId, options } = req.body;
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.cloudStorage.scanBoxFolder(folderId || '0', dlpService, options);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.scanAllCloudStorage = async (req, res) => {
  try {
    const { options } = req.body;
    
    const integrations = require('../services/index');
    const dlpService = require('../services/dlpService');
    
    const result = await integrations.cloudStorage.scanAllCloudStorage(dlpService, options);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// Notifications
// ==========================================

exports.testNotifications = async (req, res) => {
  try {
    const integrations = require('../services/index');
    
    const testIncident = {
      id: `test-${Date.now()}`,
      riskScore: 75,
      dataTypes: ['SSN', 'Credit Card'],
      source: 'Test',
      user: 'test@example.com',
      location: 'Test Location',
      timestamp: new Date()
    };
    
    const results = await integrations.notifications.notifyAll(testIncident);
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
