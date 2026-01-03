/**
 * IP Reputation Controller
 * Manages IP blacklists, whitelists, and reputation checks
 */

const externalServices = require("../services/externalServices");
const { broadcastAlert } = require("../websocket");

// In-memory lists (would be in database in production)
let blacklist = new Map();
let whitelist = new Map();

/**
 * Check IP reputation using external services
 */
exports.checkIP = async (req, res, next) => {
  try {
    const { ip } = req.params;
    
    // Check whitelist first
    if (whitelist.has(ip)) {
      return res.json({
        success: true,
        ip,
        status: "whitelisted",
        riskScore: 0,
        recommendation: "allow",
        whitelistEntry: whitelist.get(ip)
      });
    }
    
    // Check blacklist
    if (blacklist.has(ip)) {
      return res.json({
        success: true,
        ip,
        status: "blacklisted",
        riskScore: 100,
        recommendation: "block",
        blacklistEntry: blacklist.get(ip)
      });
    }
    
    // Check with IPQualityScore
    const ipqsResult = await externalServices.checkIPQualityScore(ip);
    
    res.json({
      success: true,
      ip,
      status: "checked",
      result: ipqsResult
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive IP reputation from all sources
 */
exports.getComprehensive = async (req, res, next) => {
  try {
    const { ip } = req.params;
    
    // Check whitelist first
    if (whitelist.has(ip)) {
      return res.json({
        success: true,
        ip,
        status: "whitelisted",
        riskScore: 0,
        recommendation: "allow",
        whitelistEntry: whitelist.get(ip)
      });
    }
    
    // Check blacklist
    if (blacklist.has(ip)) {
      return res.json({
        success: true,
        ip,
        status: "blacklisted",
        riskScore: 100,
        recommendation: "block",
        blacklistEntry: blacklist.get(ip)
      });
    }
    
    const result = await externalServices.getComprehensiveIPReputation(ip);
    
    // Broadcast if high risk
    if (result.riskScore >= 70) {
      broadcastAlert({
        severity: "high",
        message: `High-risk IP detected: ${ip}`,
        riskScore: result.riskScore,
        factors: result.factors
      });
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get blacklist
 */
exports.getBlacklist = async (req, res, next) => {
  try {
    const entries = Array.from(blacklist.entries()).map(([ip, data]) => ({
      ip,
      ...data
    }));
    
    res.json({
      success: true,
      total: entries.length,
      entries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add IP to blacklist
 */
exports.addToBlacklist = async (req, res, next) => {
  try {
    const { ip, reason, expiresAt } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        error: "IP address is required"
      });
    }
    
    // Remove from whitelist if present
    whitelist.delete(ip);
    
    blacklist.set(ip, {
      reason: reason || "Manual block",
      addedAt: new Date().toISOString(),
      expiresAt: expiresAt || null,
      addedBy: req.user?.id || "system"
    });
    
    broadcastAlert({
      severity: "info",
      message: `IP added to blacklist: ${ip}`,
      reason
    });
    
    res.json({
      success: true,
      message: `IP ${ip} added to blacklist`,
      entry: blacklist.get(ip)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove IP from blacklist
 */
exports.removeFromBlacklist = async (req, res, next) => {
  try {
    const { ip } = req.params;
    
    if (!blacklist.has(ip)) {
      return res.status(404).json({
        success: false,
        error: "IP not found in blacklist"
      });
    }
    
    blacklist.delete(ip);
    
    res.json({
      success: true,
      message: `IP ${ip} removed from blacklist`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get whitelist
 */
exports.getWhitelist = async (req, res, next) => {
  try {
    const entries = Array.from(whitelist.entries()).map(([ip, data]) => ({
      ip,
      ...data
    }));
    
    res.json({
      success: true,
      total: entries.length,
      entries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add IP to whitelist
 */
exports.addToWhitelist = async (req, res, next) => {
  try {
    const { ip, reason, description } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        error: "IP address is required"
      });
    }
    
    // Remove from blacklist if present
    blacklist.delete(ip);
    
    whitelist.set(ip, {
      reason: reason || "Manual whitelist",
      description: description || "",
      addedAt: new Date().toISOString(),
      addedBy: req.user?.id || "system"
    });
    
    res.json({
      success: true,
      message: `IP ${ip} added to whitelist`,
      entry: whitelist.get(ip)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove IP from whitelist
 */
exports.removeFromWhitelist = async (req, res, next) => {
  try {
    const { ip } = req.params;
    
    if (!whitelist.has(ip)) {
      return res.status(404).json({
        success: false,
        error: "IP not found in whitelist"
      });
    }
    
    whitelist.delete(ip);
    
    res.json({
      success: true,
      message: `IP ${ip} removed from whitelist`
    });
  } catch (error) {
    next(error);
  }
};
