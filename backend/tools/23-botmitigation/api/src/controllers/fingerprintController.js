/**
 * Fingerprint Controller - Browser fingerprint analysis
 */

const Fingerprint = require("../models/Fingerprint");
const botService = require("../services/botService");

const fingerprintController = {
  // Get all fingerprints
  async getAll(req, res) {
    try {
      const { isBot, riskLevel, status, page = 1, limit = 50 } = req.query;

      const query = {};

      if (isBot !== undefined) query["analysis.isBot"] = isBot === "true";
      if (riskLevel) query["analysis.riskLevel"] = riskLevel;
      if (status) query.status = status;

      const skip = (page - 1) * limit;

      const [fingerprints, total] = await Promise.all([
        Fingerprint.find(query)
          .sort({ "statistics.lastSeen": -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Fingerprint.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: fingerprints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get fingerprint by ID
  async getById(req, res) {
    try {
      const fingerprint = await Fingerprint.findOne({
        $or: [
          { _id: req.params.id },
          { fingerprintId: req.params.id },
          { hash: req.params.id },
        ],
      });

      if (!fingerprint) {
        return res
          .status(404)
          .json({ success: false, error: "Fingerprint not found" });
      }

      res.json({ success: true, data: fingerprint });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Analyze fingerprint
  async analyze(req, res) {
    try {
      const { components, clientIp } = req.body;

      // Generate hash
      const hash = botService.generateFingerprintHash(components);

      // Check if fingerprint exists
      let fingerprint = await Fingerprint.findOne({ hash });

      // Analyze for bot characteristics
      const analysis = botService.analyzeFingerprintForBot(components);

      if (fingerprint) {
        // Update existing
        fingerprint.statistics.lastSeen = new Date();
        fingerprint.statistics.totalVisits += 1;

        if (
          clientIp &&
          !fingerprint.associations.ipAddresses.includes(clientIp)
        ) {
          fingerprint.associations.ipAddresses.push(clientIp);
          fingerprint.statistics.uniqueIps =
            fingerprint.associations.ipAddresses.length;
        }

        fingerprint.analysis = { ...fingerprint.analysis, ...analysis };
        await fingerprint.save();
      } else {
        // Create new
        fingerprint = new Fingerprint({
          hash,
          components,
          analysis,
          associations: {
            ipAddresses: clientIp ? [clientIp] : [],
          },
          statistics: {
            firstSeen: new Date(),
            lastSeen: new Date(),
            totalVisits: 1,
            uniqueIps: clientIp ? 1 : 0,
          },
        });
        await fingerprint.save();
      }

      // Trigger external security integrations for bot detection
      if (analysis.isBot && analysis.score > 50) {
        botService.integrateWithSecurityStack(fingerprint._id, {
          ipAddress: clientIp,
          userAgent: components?.userAgent,
          score: analysis.score,
          type: analysis.botType || 'unknown',
          action: analysis.recommendedAction,
          requestsCount: 1,
          userId: req.user?.id
        }).catch(error => {
          console.error('Integration error:', error);
          // Don't fail the analysis if integration fails
        });
      }

      res.json({
        success: true,
        data: {
          fingerprintId: fingerprint.fingerprintId,
          hash,
          analysis,
          isNew:
            !fingerprint.statistics || fingerprint.statistics.totalVisits === 1,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Flag fingerprint
  async flag(req, res) {
    try {
      const { reason } = req.body;

      const fingerprint = await Fingerprint.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { fingerprintId: req.params.id }] },
        {
          $set: {
            "flags.isFlagged": true,
            "flags.reason": reason,
            "flags.flaggedAt": new Date(),
            "flags.flaggedBy": req.user?.id || "system",
            status: "flagged",
          },
        },
        { new: true }
      );

      if (!fingerprint) {
        return res
          .status(404)
          .json({ success: false, error: "Fingerprint not found" });
      }

      res.json({ success: true, data: fingerprint });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Compare two fingerprints
  async compare(req, res) {
    try {
      const { id1, id2 } = req.params;

      const [fp1, fp2] = await Promise.all([
        Fingerprint.findOne({ $or: [{ _id: id1 }, { fingerprintId: id1 }] }),
        Fingerprint.findOne({ $or: [{ _id: id2 }, { fingerprintId: id2 }] }),
      ]);

      if (!fp1 || !fp2) {
        return res
          .status(404)
          .json({ success: false, error: "One or both fingerprints not found" });
      }

      // Simple similarity calculation based on common properties
      const similarity = calculateFingerprintSimilarity(fp1, fp2);

      res.json({
        success: true,
        data: {
          fingerprint1: fp1,
          fingerprint2: fp2,
          similarity,
          isSimilar: similarity > 0.8,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get fingerprint clusters
  async getClusters(req, res) {
    try {
      // Group fingerprints by similar characteristics
      const clusters = await Fingerprint.aggregate([
        {
          $group: {
            _id: {
              userAgent: "$browser.userAgent",
              screen: "$screen.resolution",
              timezone: "$location.timezone",
            },
            fingerprints: { $push: "$$ROOT" },
            count: { $sum: 1 },
            firstSeen: { $min: "$firstSeen" },
            lastSeen: { $max: "$lastSeen" },
          },
        },
        {
          $match: {
            count: { $gt: 1 }, // Only clusters with multiple fingerprints
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 50,
        },
      ]);

      res.json({ success: true, data: clusters });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = fingerprintController;

// Helper function to calculate fingerprint similarity
function calculateFingerprintSimilarity(fp1, fp2) {
  let score = 0;
  let total = 0;

  // Compare browser properties
  if (fp1.browser?.userAgent && fp2.browser?.userAgent) {
    total++;
    if (fp1.browser.userAgent === fp2.browser.userAgent) score++;
  }

  // Compare screen resolution
  if (fp1.screen?.resolution && fp2.screen?.resolution) {
    total++;
    if (fp1.screen.resolution === fp2.screen.resolution) score++;
  }

  // Compare timezone
  if (fp1.location?.timezone && fp2.location?.timezone) {
    total++;
    if (fp1.location.timezone === fp2.location.timezone) score++;
  }

  // Compare language
  if (fp1.browser?.language && fp2.browser?.language) {
    total++;
    if (fp1.browser.language === fp2.browser.language) score++;
  }

  // Compare plugins count
  if (fp1.plugins && fp2.plugins) {
    total++;
    const diff = Math.abs(fp1.plugins.length - fp2.plugins.length);
    if (diff === 0) score += 1;
    else if (diff <= 2) score += 0.5;
  }

  return total > 0 ? score / total : 0;
}
