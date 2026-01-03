/**
 * CAPTCHA Controller
 * Handles CAPTCHA verification for multiple providers
 */

const externalServices = require("../services/externalServices");
const { broadcastChallengeEvent } = require("../websocket");

// CAPTCHA configuration (would be in database)
let captchaConfig = {
  provider: "recaptcha", // recaptcha, hcaptcha, turnstile
  enabled: true,
  scoreThreshold: 0.5,
  siteKeys: {
    recaptcha: process.env.RECAPTCHA_SITE_KEY || "",
    hcaptcha: process.env.HCAPTCHA_SITE_KEY || "",
    turnstile: process.env.TURNSTILE_SITE_KEY || ""
  },
  routes: [], // Protected routes that require CAPTCHA
  excludedIPs: [], // IPs that bypass CAPTCHA
  statistics: {
    totalVerifications: 0,
    successfulVerifications: 0,
    failedVerifications: 0,
    averageScore: 0
  }
};

/**
 * Verify CAPTCHA token
 */
exports.verify = async (req, res, next) => {
  try {
    const { token, provider, action, remoteIp } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: "CAPTCHA token is required"
      });
    }
    
    const captchaProvider = provider || captchaConfig.provider;
    const clientIp = remoteIp || req.ip || req.connection.remoteAddress;
    
    const result = await externalServices.verifyCaptcha(captchaProvider, token, {
      action,
      remoteIp: clientIp
    });
    
    // Update statistics
    captchaConfig.statistics.totalVerifications++;
    if (result.success || result.isHuman) {
      captchaConfig.statistics.successfulVerifications++;
    } else {
      captchaConfig.statistics.failedVerifications++;
    }
    
    // Broadcast challenge result
    broadcastChallengeEvent({
      type: captchaProvider,
      status: result.success || result.isHuman ? "passed" : "failed",
      ipAddress: clientIp,
      result: {
        score: result.score,
        isHuman: result.isHuman,
        isBot: result.isBot
      }
    });
    
    res.json({
      success: true,
      verified: result.success || result.isHuman || false,
      score: result.score,
      provider: captchaProvider,
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get CAPTCHA configuration
 */
exports.getConfig = async (req, res, next) => {
  try {
    res.json({
      success: true,
      config: {
        provider: captchaConfig.provider,
        enabled: captchaConfig.enabled,
        scoreThreshold: captchaConfig.scoreThreshold,
        siteKey: captchaConfig.siteKeys[captchaConfig.provider],
        routes: captchaConfig.routes,
        statistics: captchaConfig.statistics
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update CAPTCHA configuration
 */
exports.updateConfig = async (req, res, next) => {
  try {
    const { provider, enabled, scoreThreshold, routes, excludedIPs } = req.body;
    
    if (provider && !["recaptcha", "hcaptcha", "turnstile"].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: "Invalid CAPTCHA provider"
      });
    }
    
    if (provider) captchaConfig.provider = provider;
    if (enabled !== undefined) captchaConfig.enabled = enabled;
    if (scoreThreshold !== undefined) captchaConfig.scoreThreshold = scoreThreshold;
    if (routes) captchaConfig.routes = routes;
    if (excludedIPs) captchaConfig.excludedIPs = excludedIPs;
    
    res.json({
      success: true,
      message: "CAPTCHA configuration updated",
      config: {
        provider: captchaConfig.provider,
        enabled: captchaConfig.enabled,
        scoreThreshold: captchaConfig.scoreThreshold,
        routes: captchaConfig.routes
      }
    });
  } catch (error) {
    next(error);
  }
};
