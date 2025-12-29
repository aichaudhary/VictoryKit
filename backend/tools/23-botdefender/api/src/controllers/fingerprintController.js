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
};

module.exports = fingerprintController;
