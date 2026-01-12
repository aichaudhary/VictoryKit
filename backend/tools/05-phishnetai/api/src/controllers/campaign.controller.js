/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎣 PHISHNETAI - CAMPAIGN CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * Handles phishing campaign tracking and management
 */

const { Campaign, Analysis } = require('../models');
const crypto = require('crypto');

// Generate campaign ID
const generateCampaignId = () => `CAMP-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

// Create new campaign
exports.createCampaign = async (req, res) => {
  try {
    const {
      name,
      targetBrand,
      targetIndustry,
      type,
      initialDomains = [],
      initialUrls = [],
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Campaign name is required',
      });
    }

    const campaign = new Campaign({
      campaignId: generateCampaignId(),
      name,
      target: {
        brand: targetBrand,
        industry: targetIndustry,
        type: type || 'credential_harvest',
      },
      domains: initialDomains.map((d) => ({
        domain: d,
        firstSeen: new Date(),
        lastSeen: new Date(),
        active: true,
      })),
      urls: initialUrls.map((u) => ({
        url: u,
        firstSeen: new Date(),
        lastSeen: new Date(),
        active: true,
      })),
      timeline: {
        firstSeen: new Date(),
        lastSeen: new Date(),
      },
      stats: {
        totalSamples: initialDomains.length + initialUrls.length,
      },
      tags: [targetBrand, targetIndustry, type].filter(Boolean),
    });

    await campaign.save();

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get campaign by ID
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      campaignId: req.params.id,
    }).populate('analyses');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all campaigns
exports.getAllCampaigns = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      severity,
      brand,
      sort = '-timeline.lastSeen',
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (brand) query['target.brand'] = { $regex: brand, $options: 'i' };

    const campaigns = await Campaign.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('campaignId name status severity target timeline stats tags');

    const total = await Campaign.countDocuments(query);

    res.json({
      success: true,
      data: campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get active campaigns
exports.getActiveCampaigns = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const campaigns = await Campaign.findActive(parseInt(limit));

    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add domain to campaign
exports.addDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const { domain, registrar, hosting } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required',
      });
    }

    const campaign = await Campaign.findOne({ campaignId: id });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    await campaign.addDomain(domain, registrar, hosting);

    res.json({
      success: true,
      message: `Domain ${domain} added to campaign`,
      data: {
        campaignId: campaign.campaignId,
        domainsCount: campaign.domains.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add URL to campaign
exports.addUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
      });
    }

    const campaign = await Campaign.findOne({ campaignId: id });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    await campaign.addUrl(url);

    res.json({
      success: true,
      message: `URL added to campaign`,
      data: {
        campaignId: campaign.campaignId,
        urlsCount: campaign.urls.length,
        totalSamples: campaign.stats.totalSamples,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update campaign status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['active', 'dormant', 'takedown_requested', 'taken_down', 'monitoring'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const campaign = await Campaign.findOne({ campaignId: id });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    await campaign.updateStatus(status, note);

    res.json({
      success: true,
      message: `Campaign status updated to ${status}`,
      data: {
        campaignId: campaign.campaignId,
        status: campaign.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add note to campaign
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Note content is required',
      });
    }

    const campaign = await Campaign.findOneAndUpdate(
      { campaignId: id },
      {
        $push: {
          notes: {
            author: author || req.user?.name || 'anonymous',
            content,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      message: 'Note added to campaign',
      data: {
        campaignId: campaign.campaignId,
        notesCount: campaign.notes.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Link analysis to campaign
exports.linkAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { analysisId } = req.body;

    const [campaign, analysis] = await Promise.all([
      Campaign.findOne({ campaignId: id }),
      Analysis.findOne({ analysisId }),
    ]);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found',
      });
    }

    // Add analysis to campaign if not already present
    if (!campaign.analyses.includes(analysis._id)) {
      campaign.analyses.push(analysis._id);
      await campaign.save();
    }

    res.json({
      success: true,
      message: 'Analysis linked to campaign',
      data: {
        campaignId: campaign.campaignId,
        analysisId: analysis.analysisId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get campaign statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await Campaign.getStats();

    const byType = await Campaign.aggregate([
      {
        $group: {
          _id: '$target.type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byBrand = await Campaign.aggregate([
      { $match: { 'target.brand': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$target.brand',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        byType,
        byBrand,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Search campaigns
exports.searchCampaigns = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const campaigns = await Campaign.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { 'target.brand': { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { 'domains.domain': { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ 'timeline.lastSeen': -1 })
      .limit(50)
      .select('campaignId name status target timeline stats');

    res.json({
      success: true,
      data: campaigns,
      query: q,
      count: campaigns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      campaignId: req.params.id,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    res.json({
      success: true,
      message: `Campaign ${campaign.name} deleted`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
