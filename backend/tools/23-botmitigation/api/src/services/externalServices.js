/**
 * External Bot Detection Services Integration
 * Integrates with multiple third-party APIs for comprehensive bot detection
 */

const axios = require("axios");

/**
 * IPQualityScore - Fraud Detection
 * https://www.ipqualityscore.com/documentation/proxy-detection/overview
 */
async function checkIPQualityScore(ipAddress) {
  const apiKey = process.env.IPQUALITYSCORE_API_KEY;
  if (!apiKey || apiKey.startsWith("your-")) {
    return { available: false, reason: "API key not configured" };
  }

  try {
    const strictness = process.env.IPQUALITYSCORE_STRICTNESS || 1;
    const response = await axios.get(
      `https://ipqualityscore.com/api/json/ip/${apiKey}/${ipAddress}`,
      {
        params: {
          strictness,
          allow_public_access_points: true,
          fast: true,
          lighter_penalties: false,
          mobile: true,
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    return {
      available: true,
      success: data.success,
      fraudScore: data.fraud_score,
      isProxy: data.proxy,
      isVPN: data.vpn,
      isTor: data.tor,
      isBot: data.bot_status,
      isCrawler: data.is_crawler,
      recentAbuse: data.recent_abuse,
      country: data.country_code,
      city: data.city,
      isp: data.ISP,
      organization: data.organization,
      abuseVelocity: data.abuse_velocity,
      connectionType: data.connection_type,
    };
  } catch (error) {
    console.error("IPQualityScore API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * AbuseIPDB - IP Abuse Reports
 * https://docs.abuseipdb.com/
 */
async function checkAbuseIPDB(ipAddress) {
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  if (!apiKey || apiKey.startsWith("your-")) {
    return { available: false, reason: "API key not configured" };
  }

  try {
    const response = await axios.get("https://api.abuseipdb.com/api/v2/check", {
      params: {
        ipAddress,
        maxAgeInDays: 90,
        verbose: true,
      },
      headers: {
        Key: apiKey,
        Accept: "application/json",
      },
      timeout: 5000,
    });

    const data = response.data.data;
    return {
      available: true,
      ipAddress: data.ipAddress,
      isPublic: data.isPublic,
      abuseConfidenceScore: data.abuseConfidenceScore,
      countryCode: data.countryCode,
      usageType: data.usageType,
      isp: data.isp,
      domain: data.domain,
      isTor: data.isTor,
      totalReports: data.totalReports,
      numDistinctUsers: data.numDistinctUsers,
      lastReportedAt: data.lastReportedAt,
      isWhitelisted: data.isWhitelisted,
    };
  } catch (error) {
    console.error("AbuseIPDB API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * IPInfo.io - IP Geolocation & VPN Detection
 * https://ipinfo.io/developers
 */
async function checkIPInfo(ipAddress) {
  const token = process.env.IPINFO_TOKEN;
  if (!token || token.startsWith("your-")) {
    return { available: false, reason: "API token not configured" };
  }

  try {
    const response = await axios.get(`https://ipinfo.io/${ipAddress}`, {
      params: { token },
      timeout: 5000,
    });

    const data = response.data;
    return {
      available: true,
      ip: data.ip,
      hostname: data.hostname,
      city: data.city,
      region: data.region,
      country: data.country,
      loc: data.loc,
      org: data.org,
      postal: data.postal,
      timezone: data.timezone,
      privacy: data.privacy, // VPN, proxy, tor, relay, hosting
    };
  } catch (error) {
    console.error("IPInfo API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Google reCAPTCHA v3 Verification
 * https://developers.google.com/recaptcha/docs/v3
 */
async function verifyRecaptcha(token, action = "submit") {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey || secretKey.startsWith("your-")) {
    return { available: false, reason: "API key not configured" };
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    const threshold = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;
    
    return {
      available: true,
      success: data.success,
      score: data.score,
      action: data.action,
      actionMatched: data.action === action,
      isHuman: data.success && data.score >= threshold,
      isBot: data.success && data.score < threshold,
      challengeTimestamp: data.challenge_ts,
      hostname: data.hostname,
      errorCodes: data["error-codes"],
    };
  } catch (error) {
    console.error("reCAPTCHA API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * hCaptcha Verification
 * https://docs.hcaptcha.com/
 */
async function verifyHCaptcha(token) {
  const secretKey = process.env.HCAPTCHA_SECRET_KEY;
  if (!secretKey || secretKey.startsWith("your-")) {
    return { available: false, reason: "API key not configured" };
  }

  try {
    const response = await axios.post(
      "https://hcaptcha.com/siteverify",
      new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    return {
      available: true,
      success: data.success,
      challengeTimestamp: data.challenge_ts,
      hostname: data.hostname,
      credit: data.credit,
      errorCodes: data["error-codes"],
      score: data.score,
      scoreReason: data.score_reason,
    };
  } catch (error) {
    console.error("hCaptcha API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Cloudflare Turnstile Verification
 * https://developers.cloudflare.com/turnstile/
 */
async function verifyTurnstile(token, remoteIp) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey || secretKey.startsWith("your-")) {
    return { available: false, reason: "API key not configured" };
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      },
      {
        timeout: 5000,
      }
    );

    const data = response.data;
    return {
      available: true,
      success: data.success,
      challengeTimestamp: data.challenge_ts,
      hostname: data.hostname,
      errorCodes: data["error-codes"],
      action: data.action,
      cdata: data.cdata,
    };
  } catch (error) {
    console.error("Turnstile API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * GreyNoise - Internet Scanner Intelligence
 * https://docs.greynoise.io/
 */
async function checkGreyNoise(ipAddress) {
  const apiKey = process.env.GREYNOISE_API_KEY;
  if (!apiKey || apiKey.startsWith("your-")) {
    return { available: false, reason: "API key not configured" };
  }

  try {
    const response = await axios.get(
      `https://api.greynoise.io/v3/community/${ipAddress}`,
      {
        headers: {
          key: apiKey,
        },
        timeout: 5000,
      }
    );

    const data = response.data;
    return {
      available: true,
      ip: data.ip,
      noise: data.noise, // Is this IP scanning the internet?
      riot: data.riot, // Is this a known benign service?
      classification: data.classification, // malicious, benign, unknown
      name: data.name,
      link: data.link,
      lastSeen: data.last_seen,
      message: data.message,
    };
  } catch (error) {
    console.error("GreyNoise API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Shodan - Internet Scanning Data
 * https://developer.shodan.io/api
 */
async function checkShodan(ipAddress) {
  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey || apiKey.startsWith("your-")) {
    return { available: false, reason: "API key not configured" };
  }

  try {
    const response = await axios.get(
      `https://api.shodan.io/shodan/host/${ipAddress}`,
      {
        params: { key: apiKey },
        timeout: 5000,
      }
    );

    const data = response.data;
    return {
      available: true,
      ip: data.ip_str,
      org: data.org,
      isp: data.isp,
      asn: data.asn,
      hostnames: data.hostnames,
      country: data.country_code,
      city: data.city,
      ports: data.ports,
      vulns: data.vulns,
      tags: data.tags,
      lastUpdate: data.last_update,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { available: true, found: false, message: "No data found for IP" };
    }
    console.error("Shodan API error:", error.message);
    return { available: false, error: error.message };
  }
}

/**
 * Comprehensive IP Reputation Check
 * Aggregates data from multiple sources
 */
async function getComprehensiveIPReputation(ipAddress) {
  const results = await Promise.allSettled([
    checkIPQualityScore(ipAddress),
    checkAbuseIPDB(ipAddress),
    checkIPInfo(ipAddress),
    checkGreyNoise(ipAddress),
  ]);

  const [ipqs, abuseipdb, ipinfo, greynoise] = results.map((r) =>
    r.status === "fulfilled" ? r.value : { available: false, error: r.reason }
  );

  // Calculate aggregate risk score
  let riskScore = 0;
  let factors = [];

  if (ipqs.available && ipqs.success) {
    if (ipqs.isBot) {
      riskScore += 30;
      factors.push("Known bot (IPQS)");
    }
    if (ipqs.isProxy || ipqs.isVPN) {
      riskScore += 15;
      factors.push("Proxy/VPN detected");
    }
    if (ipqs.isTor) {
      riskScore += 25;
      factors.push("Tor exit node");
    }
    if (ipqs.fraudScore > 75) {
      riskScore += 20;
      factors.push(`High fraud score: ${ipqs.fraudScore}`);
    }
  }

  if (abuseipdb.available) {
    if (abuseipdb.abuseConfidenceScore > 50) {
      riskScore += 20;
      factors.push(`Abuse reports: ${abuseipdb.totalReports}`);
    }
    if (abuseipdb.isTor) {
      riskScore += 10;
      factors.push("Tor node (AbuseIPDB)");
    }
  }

  if (greynoise.available) {
    if (greynoise.noise) {
      riskScore += 15;
      factors.push("Internet scanner (GreyNoise)");
    }
    if (greynoise.classification === "malicious") {
      riskScore += 25;
      factors.push("Malicious classification");
    }
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100);

  // Determine recommendation
  let recommendation = "allow";
  if (riskScore >= 70) {
    recommendation = "block";
  } else if (riskScore >= 40) {
    recommendation = "challenge";
  } else if (riskScore >= 20) {
    recommendation = "monitor";
  }

  return {
    ipAddress,
    riskScore,
    recommendation,
    factors,
    sources: {
      ipQualityScore: ipqs,
      abuseIPDB: abuseipdb,
      ipInfo: ipinfo,
      greyNoise: greynoise,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verify CAPTCHA (supports multiple providers)
 */
async function verifyCaptcha(provider, token, options = {}) {
  switch (provider.toLowerCase()) {
    case "recaptcha":
      return verifyRecaptcha(token, options.action);
    case "hcaptcha":
      return verifyHCaptcha(token);
    case "turnstile":
      return verifyTurnstile(token, options.remoteIp);
    default:
      return { available: false, error: `Unknown provider: ${provider}` };
  }
}

module.exports = {
  checkIPQualityScore,
  checkAbuseIPDB,
  checkIPInfo,
  checkGreyNoise,
  checkShodan,
  verifyRecaptcha,
  verifyHCaptcha,
  verifyTurnstile,
  verifyCaptcha,
  getComprehensiveIPReputation,
};
