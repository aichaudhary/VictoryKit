/**
 * Attack Controller - DDoS attack management
 */

const Attack = require("../models/Attack");
const ddosService = require("../services/ddosService");

const attackController = {
  // Get all attacks
  async getAll(req, res) {
    try {
      const {
        type,
        status,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = req.query;

      const query = {};

      if (type) query.type = type;
      if (status) query.status = status;
      if (startDate || endDate) {
        query["timeline.detected"] = {};
        if (startDate) query["timeline.detected"].$gte = new Date(startDate);
        if (endDate) query["timeline.detected"].$lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;

      const [attacks, total] = await Promise.all([
        Attack.find(query)
          .sort({ "timeline.detected": -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Attack.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: attacks,
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

  // Get active attacks
  async getActive(req, res) {
    try {
      const attacks = await Attack.find({
        status: { $in: ["detected", "active", "mitigating"] },
      }).sort({ "timeline.detected": -1 });

      res.json({
        success: true,
        data: attacks,
        count: attacks.length,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get attack by ID
  async getById(req, res) {
    try {
      const attack = await Attack.findOne({
        $or: [{ _id: req.params.id }, { attackId: req.params.id }],
      });

      if (!attack) {
        return res
          .status(404)
          .json({ success: false, error: "Attack not found" });
      }

      res.json({ success: true, data: attack });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Detect attack from traffic data
  async detect(req, res) {
    try {
      const trafficData = req.body;

      // Run detection
      const result = await ddosService.detectAttack(trafficData);

      if (result.isAttack) {
        // Create attack record
        const attack = new Attack({
          type: result.type,
          subType: result.subType,
          target: trafficData.target,
          source: result.source,
          metrics: result.metrics,
          timeline: {
            detected: new Date(),
            started: result.estimatedStart,
          },
          detection: {
            method: result.method,
            confidence: result.confidence,
            signals: result.signals,
          },
          status: "detected",
        });

        await attack.save();

        // Trigger external security integrations
        ddosService.integrateWithSecurityStack(attack._id, {
          type: attack.type,
          severity: result.severity,
          bandwidth: attack.metrics?.bandwidth?.inbound,
          packetRate: attack.metrics?.packets?.inbound,
          sourceIPs: attack.source?.ips,
          mitigationStatus: attack.status,
          zoneId: attack.target?.zoneId,
          affectedEndpoints: attack.target?.endpoints,
          userId: req.user?.id
        }).catch(error => {
          console.error('Integration error:', error);
          // Don't fail the attack detection if integration fails
        });

        // Auto-mitigate if confidence is high
        if (result.confidence >= 90) {
          await ddosService.autoMitigate(attack);
        }
      }

      res.json({
        success: true,
        data: {
          isAttack: result.isAttack,
          confidence: result.confidence,
          type: result.type,
          severity: result.severity,
          signals: result.signals,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update attack
  async update(req, res) {
    try {
      const attack = await Attack.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { attackId: req.params.id }] },
        { $set: req.body },
        { new: true }
      );

      if (!attack) {
        return res
          .status(404)
          .json({ success: false, error: "Attack not found" });
      }

      res.json({ success: true, data: attack });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Mitigate attack
  async mitigate(req, res) {
    try {
      const { actions } = req.body;

      const attack = await Attack.findOne({
        $or: [{ _id: req.params.id }, { attackId: req.params.id }],
      });

      if (!attack) {
        return res
          .status(404)
          .json({ success: false, error: "Attack not found" });
      }

      // Apply mitigation
      const result = await ddosService.mitigate(attack, actions);

      // Update attack status
      attack.status = "mitigating";
      attack.mitigation.status = "active";
      attack.mitigation.actions.push(...result.appliedActions);
      await attack.save();

      res.json({
        success: true,
        data: {
          attack,
          mitigation: result,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = attackController;
