/**
 * Bot Service - Bot detection and analysis logic
 */

const crypto = require("crypto");
const Bot = require("../models/Bot");
const { getConnectors } = require('../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || "http://localhost:8023";

const botService = {
  /**
   * Detect if request is from a bot
   */
  async detect(requestData) {
    const signals = [];
    let score = 0;

    // User agent analysis
    const uaSignals = this.analyzeUserAgent(requestData.userAgent);
    signals.push(...uaSignals.signals);
    score += uaSignals.score;

    // Behavioral analysis
    const behaviorSignals = this.analyzeBehavior(requestData);
    signals.push(...behaviorSignals.signals);
    score += behaviorSignals.score;

    // Rate analysis
    const rateSignals = this.analyzeRate(requestData);
    signals.push(...rateSignals.signals);
    score += rateSignals.score;

    // Fingerprint analysis
    if (requestData.fingerprint) {
      const fpSignals = this.analyzeFingerprintForBot(requestData.fingerprint);
      if (fpSignals.isBot) {
        signals.push({ signal: "suspicious_fingerprint", weight: 20 });
        score += 20;
      }
    }

    // Try ML engine for advanced detection
    try {
      const mlResult = await this.mlDetect(requestData);
      if (mlResult && mlResult.score) {
        score = Math.round((score + mlResult.score) / 2);
        signals.push(...(mlResult.signals || []));
      }
    } catch (error) {
      // ML engine unavailable, use rule-based only
    }

    // Normalize score
    score = Math.min(100, Math.max(0, score));

    // Determine classification
    const classification = this.classify(score, signals);

    return {
      isBot: score >= 50,
      score,
      signals,
      classification,
      recommendedAction: this.recommendAction(score, classification),
    };
  },

  /**
   * Analyze user agent
   */
  analyzeUserAgent(userAgent) {
    const signals = [];
    let score = 0;

    if (!userAgent) {
      signals.push({ signal: "missing_user_agent", weight: 30 });
      return { signals, score: 30 };
    }

    const ua = userAgent.toLowerCase();

    // Known bot patterns
    const botPatterns = [
      {
        pattern: /bot|crawler|spider|scraper/i,
        weight: 25,
        type: "bot_identifier",
      },
      {
        pattern: /curl|wget|python|java|php|ruby|perl|go-http/i,
        weight: 20,
        type: "tool_identifier",
      },
      {
        pattern: /headless|phantom|selenium|puppeteer|playwright/i,
        weight: 30,
        type: "automation_tool",
      },
    ];

    for (const { pattern, weight, type } of botPatterns) {
      if (pattern.test(userAgent)) {
        signals.push({ signal: type, weight, value: userAgent });
        score += weight;
      }
    }

    // Good bots
    const goodBots = [
      "googlebot",
      "bingbot",
      "yandexbot",
      "facebookexternalhit",
      "twitterbot",
    ];
    for (const bot of goodBots) {
      if (ua.includes(bot)) {
        signals.push({ signal: "known_good_bot", weight: -20, value: bot });
        score -= 20;
      }
    }

    return { signals, score: Math.max(0, score) };
  },

  /**
   * Analyze behavioral patterns
   */
  analyzeBehavior(requestData) {
    const signals = [];
    let score = 0;

    // No mouse movement or keyboard
    if (
      requestData.mouseMovement === false &&
      requestData.keyboardInput === false
    ) {
      signals.push({ signal: "no_human_interaction", weight: 15 });
      score += 15;
    }

    // Abnormal session duration
    if (requestData.sessionDuration !== undefined) {
      if (requestData.sessionDuration < 1000) {
        // Less than 1 second
        signals.push({
          signal: "too_short_session",
          weight: 20,
          value: requestData.sessionDuration,
        });
        score += 20;
      }
    }

    // Linear request pattern
    if (requestData.requestPattern === "sequential") {
      signals.push({ signal: "sequential_pattern", weight: 15 });
      score += 15;
    }

    return { signals, score };
  },

  /**
   * Analyze request rate
   */
  analyzeRate(requestData) {
    const signals = [];
    let score = 0;

    if (requestData.requestsPerMinute) {
      if (requestData.requestsPerMinute > 100) {
        signals.push({
          signal: "high_request_rate",
          weight: 25,
          value: requestData.requestsPerMinute,
        });
        score += 25;
      } else if (requestData.requestsPerMinute > 50) {
        signals.push({
          signal: "elevated_request_rate",
          weight: 15,
          value: requestData.requestsPerMinute,
        });
        score += 15;
      }
    }

    return { signals, score };
  },

  /**
   * Analyze fingerprint for bot characteristics
   */
  analyzeFingerprintForBot(components) {
    const inconsistencies = [];
    const emulationSignals = [];
    let botProbability = 0;

    if (!components) {
      return { isBot: false, botProbability: 0, riskLevel: "low" };
    }

    // Check for headless browser indicators
    if (components.webgl?.renderer?.includes("SwiftShader")) {
      emulationSignals.push("swiftshader_webgl");
      botProbability += 25;
    }

    // Navigator properties missing
    if (components.hardwareConcurrency === 0 || components.deviceMemory === 0) {
      emulationSignals.push("missing_hardware_info");
      botProbability += 15;
    }

    // Screen size mismatch
    if (components.screen?.width === 0 || components.screen?.height === 0) {
      inconsistencies.push("invalid_screen_size");
      botProbability += 20;
    }

    // No plugins in non-mobile browser
    if (
      components.device?.type === "desktop" &&
      (!components.plugins || components.plugins.length === 0)
    ) {
      inconsistencies.push("no_plugins_desktop");
      botProbability += 10;
    }

    // WebRTC disabled (common in bots)
    if (components.features?.webRTC === false) {
      emulationSignals.push("webrtc_disabled");
      botProbability += 10;
    }

    // Determine risk level
    let riskLevel = "low";
    if (botProbability >= 60) riskLevel = "critical";
    else if (botProbability >= 40) riskLevel = "high";
    else if (botProbability >= 20) riskLevel = "medium";

    return {
      isBot: botProbability >= 50,
      botProbability: Math.min(100, botProbability),
      isInconsistent: inconsistencies.length > 0,
      inconsistencies,
      isEmulated: emulationSignals.length > 0,
      emulationSignals,
      riskLevel,
    };
  },

  /**
   * Generate fingerprint hash
   */
  generateFingerprintHash(components) {
    const data = JSON.stringify({
      ua: components.userAgent,
      screen: components.screen,
      canvas: components.canvas?.hash,
      webgl: components.webgl?.hash,
      fonts: components.fontsHash,
      plugins: components.pluginsHash,
      timezone: components.timezone,
    });

    return crypto.createHash("sha256").update(data).digest("hex");
  },

  /**
   * Classify bot type
   */
  classify(score, signals) {
    const signalTypes = signals.map((s) => s.signal);

    let type = "unknown";
    let category = "custom";

    if (score < 30) {
      type = "good";
      if (signalTypes.includes("known_good_bot")) {
        category = "search_engine";
      }
    } else if (score >= 50) {
      type = "bad";

      if (signalTypes.includes("high_request_rate")) {
        category = "scraper";
      } else if (signalTypes.includes("automation_tool")) {
        category = "scanner";
      } else if (signalTypes.includes("tool_identifier")) {
        category = "api_abuser";
      }
    }

    return { type, category, confidence: score };
  },

  /**
   * Recommend action based on score
   */
  recommendAction(score, classification) {
    if (classification.type === "good") {
      return "allow";
    }

    if (score >= 80) return "block";
    if (score >= 60) return "challenge";
    if (score >= 40) return "rate_limit";

    return "monitor";
  },

  /**
   * Record bot in database
   */
  async recordBot(detection, requestData) {
    try {
      const existingBot = await Bot.findOne({
        $or: [
          { "identification.fingerprint": requestData.fingerprint },
          { "identification.ipAddresses": requestData.ip },
        ],
      });

      if (existingBot) {
        // Update existing
        existingBot.detection.lastSeen = new Date();
        existingBot.detection.score = detection.score;
        existingBot.statistics.totalRequests += 1;

        if (!existingBot.identification.ipAddresses.includes(requestData.ip)) {
          existingBot.identification.ipAddresses.push(requestData.ip);
        }

        await existingBot.save();
        return existingBot;
      } else {
        // Create new
        const bot = new Bot({
          classification: detection.classification,
          identification: {
            userAgent: requestData.userAgent,
            ipAddresses: requestData.ip ? [requestData.ip] : [],
            fingerprint: requestData.fingerprint,
          },
          detection: {
            method: "behavioral",
            signals: detection.signals,
            score: detection.score,
            firstDetected: new Date(),
            lastSeen: new Date(),
          },
          action: {
            current: detection.recommendedAction,
          },
          statistics: {
            totalRequests: 1,
          },
        });

        await bot.save();
        return bot;
      }
    } catch (error) {
      console.error("Error recording bot:", error);
      return null;
    }
  },

  /**
   * ML-based detection
   */
  async mlDetect(requestData) {
    try {
      const response = await fetch(`${ML_ENGINE_URL}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // ML engine unavailable
    }
    return null;
  },

  // Integration with external security stack
  async integrateWithSecurityStack(botId, botData) {
    try {
      const connectors = getConnectors();
      const integrationPromises = [];

      // Microsoft Sentinel - Log bot detection events
      if (connectors.sentinel) {
        integrationPromises.push(
          connectors.sentinel.ingestData({
            table: 'BotDetection_CL',
            data: {
              BotId: botId,
              IPAddress: botData.ipAddress,
              UserAgent: botData.userAgent,
              BotScore: botData.score,
              BotType: botData.type,
              ActionTaken: botData.action,
              RequestsCount: botData.requestsCount,
              Timestamp: new Date().toISOString(),
              Source: 'BotMitigation'
            }
          }).catch(err => console.error('Sentinel integration failed:', err.message))
        );
      }

      // Cortex XSOAR - Create incident for high-confidence bots
      if (connectors.cortexXSOAR && botData.score > 80) {
        integrationPromises.push(
          connectors.cortexXSOAR.createIncident({
            name: `Bot Attack Detected - ${botId}`,
            type: 'Bot Attack',
            severity: botData.score > 90 ? 'High' : 'Medium',
            details: {
              botId,
              ipAddress: botData.ipAddress,
              botType: botData.type,
              score: botData.score,
              requestsCount: botData.requestsCount
            }
          }).catch(err => console.error('XSOAR integration failed:', err.message))
        );
      }

      // Cloudflare - Block bot IPs
      if (connectors.cloudflare && botData.score > 70) {
        integrationPromises.push(
          connectors.cloudflare.createWAFRule({
            description: `Block detected bot: ${botData.ipAddress}`,
            expression: `ip.src eq ${botData.ipAddress}`,
            action: 'block'
          }).catch(err => console.error('Cloudflare WAF rule creation failed:', err.message))
        );
      }

      // Kong - Rate limit suspicious IPs
      if (connectors.kong && botData.score > 60) {
        integrationPromises.push(
          connectors.kong.createRateLimit({
            consumer: botData.ipAddress,
            config: {
              second: 5, // Very low rate limit for suspected bots
              policy: 'local'
            }
          }).catch(err => console.error('Kong rate limit creation failed:', err.message))
        );
      }

      await Promise.allSettled(integrationPromises);
      console.log('BotMitigation security stack integration completed');

    } catch (error) {
      console.error('BotMitigation integration error:', error);
    }
  }
};

module.exports = botService;
