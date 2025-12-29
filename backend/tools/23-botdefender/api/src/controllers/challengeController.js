/**
 * Challenge Controller - Bot verification challenges
 */

const Challenge = require("../models/Challenge");

const challengeController = {
  // Get all challenges
  async getAll(req, res) {
    try {
      const { type, status } = req.query;
      const query = {};

      if (type) query.type = type;
      if (status) query.status = status;

      const challenges = await Challenge.find(query).sort({ updatedAt: -1 });

      res.json({ success: true, data: challenges });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get challenge by ID
  async getById(req, res) {
    try {
      const challenge = await Challenge.findOne({
        $or: [{ _id: req.params.id }, { challengeId: req.params.id }],
      });

      if (!challenge) {
        return res
          .status(404)
          .json({ success: false, error: "Challenge not found" });
      }

      res.json({ success: true, data: challenge });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Create challenge
  async create(req, res) {
    try {
      const challenge = new Challenge(req.body);
      await challenge.save();

      res.status(201).json({ success: true, data: challenge });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update challenge
  async update(req, res) {
    try {
      const challenge = await Challenge.findOneAndUpdate(
        { $or: [{ _id: req.params.id }, { challengeId: req.params.id }] },
        { $set: req.body },
        { new: true }
      );

      if (!challenge) {
        return res
          .status(404)
          .json({ success: false, error: "Challenge not found" });
      }

      res.json({ success: true, data: challenge });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Delete challenge
  async delete(req, res) {
    try {
      const challenge = await Challenge.findOneAndDelete({
        $or: [{ _id: req.params.id }, { challengeId: req.params.id }],
      });

      if (!challenge) {
        return res
          .status(404)
          .json({ success: false, error: "Challenge not found" });
      }

      res.json({ success: true, message: "Challenge deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Verify challenge response
  async verify(req, res) {
    try {
      const { response, token } = req.body;

      const challenge = await Challenge.findOne({
        $or: [{ _id: req.params.id }, { challengeId: req.params.id }],
      });

      if (!challenge) {
        return res
          .status(404)
          .json({ success: false, error: "Challenge not found" });
      }

      // Verify based on challenge type
      let passed = false;
      let message = "";

      switch (challenge.type) {
        case "captcha":
        case "recaptcha":
        case "hcaptcha":
          // Verify with external service
          passed = await verifyCaptcha(challenge.type, response, token);
          message = passed ? "Captcha verified" : "Captcha verification failed";
          break;

        case "javascript":
          passed = response && response.jsEnabled === true;
          message = passed
            ? "JavaScript verified"
            : "JavaScript verification failed";
          break;

        case "cookie":
          passed = response && response.cookieValue === token;
          message = passed ? "Cookie verified" : "Cookie verification failed";
          break;

        case "proof_of_work":
          passed = verifyProofOfWork(
            response,
            challenge.configuration.parameters
          );
          message = passed ? "Proof of work verified" : "Invalid proof of work";
          break;

        default:
          passed = !!response;
          message = passed ? "Challenge completed" : "Challenge failed";
      }

      // Update statistics
      if (passed) {
        challenge.statistics.passed += 1;
      } else {
        challenge.statistics.failed += 1;
      }
      challenge.statistics.passRate =
        (challenge.statistics.passed /
          (challenge.statistics.passed + challenge.statistics.failed)) *
        100;
      await challenge.save();

      res.json({
        success: passed,
        data: {
          verified: passed,
          message,
          nextAction: passed ? "allow" : challenge.fallback.onFail,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

// Helper functions
async function verifyCaptcha(type, response, token) {
  // In production, call external APIs
  // For demo, simulate verification
  return !!response && response.length > 0;
}

function verifyProofOfWork(response, params) {
  // Verify computational proof
  if (!response || !response.nonce) return false;

  const difficulty = params?.difficulty || 4;
  const hash = response.hash || "";

  // Check if hash starts with required zeros
  const target = "0".repeat(difficulty);
  return hash.startsWith(target);
}

module.exports = challengeController;
