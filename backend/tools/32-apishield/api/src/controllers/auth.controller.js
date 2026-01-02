const AuthTester = require('../services/auth.tester');
const { APIEndpoint } = require('../models');

// Test authentication on endpoint
exports.testAuth = async (req, res) => {
  try {
    const {
      targetUrl,
      method,
      path,
      authType,
      token,
      apiKey,
      username,
      password
    } = req.body;

    if (!targetUrl || !method || !path) {
      return res.status(400).json({
        success: false,
        error: 'targetUrl, method, and path are required'
      });
    }

    const endpoint = { method, path, fullUrl: `${targetUrl}${path}` };
    const authConfig = { type: authType, token, apiKey, username, password };

    const findings = await AuthTester.testEndpoint(targetUrl, endpoint, authConfig);

    res.json({
      success: true,
      data: {
        endpoint: `${method} ${path}`,
        findings,
        testsRun: [
          'Missing Authentication',
          'Token Manipulation',
          'Privilege Escalation',
          'Session Handling'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test JWT token
exports.testJWT = async (req, res) => {
  try {
    const { token, secret } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const jwtResults = await AuthTester.analyzeJWT(token, secret);

    res.json({
      success: true,
      data: jwtResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test OAuth flow
exports.testOAuth = async (req, res) => {
  try {
    const {
      authorizationUrl,
      tokenUrl,
      clientId,
      clientSecret,
      redirectUri,
      scopes
    } = req.body;

    if (!authorizationUrl || !tokenUrl) {
      return res.status(400).json({
        success: false,
        error: 'authorizationUrl and tokenUrl are required'
      });
    }

    const oauthResults = await AuthTester.testOAuthFlow({
      authorizationUrl,
      tokenUrl,
      clientId,
      clientSecret,
      redirectUri,
      scopes
    });

    res.json({
      success: true,
      data: oauthResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test API key security
exports.testAPIKey = async (req, res) => {
  try {
    const {
      targetUrl,
      apiKey,
      keyLocation,
      keyName
    } = req.body;

    if (!targetUrl || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'targetUrl and apiKey are required'
      });
    }

    const apiKeyResults = await AuthTester.testAPIKeySecurity({
      targetUrl,
      apiKey,
      keyLocation: keyLocation || 'header',
      keyName: keyName || 'X-API-Key'
    });

    res.json({
      success: true,
      data: apiKeyResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test rate limiting on auth endpoints
exports.testRateLimiting = async (req, res) => {
  try {
    const {
      targetUrl,
      method = 'POST',
      path = '/auth/login',
      requestCount = 20,
      payload
    } = req.body;

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'targetUrl is required'
      });
    }

    const rateLimitResults = await AuthTester.testRateLimiting({
      url: `${targetUrl}${path}`,
      method,
      requestCount,
      payload: payload || { username: 'test', password: 'test' }
    });

    res.json({
      success: true,
      data: rateLimitResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Test CORS configuration
exports.testCORS = async (req, res) => {
  try {
    const { targetUrl, testOrigins } = req.body;

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'targetUrl is required'
      });
    }

    const defaultOrigins = [
      'https://evil.com',
      'http://localhost:3000',
      'null',
      'https://attacker.example.com'
    ];

    const corsResults = await AuthTester.testCORS(
      targetUrl,
      testOrigins || defaultOrigins
    );

    res.json({
      success: true,
      data: corsResults
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Full authentication suite test
exports.fullAuthSuite = async (req, res) => {
  try {
    const {
      targetUrl,
      endpoints,
      authentication,
      includeTests = ['all']
    } = req.body;

    if (!targetUrl) {
      return res.status(400).json({
        success: false,
        error: 'targetUrl is required'
      });
    }

    const results = {
      endpoint: targetUrl,
      testsRun: [],
      findings: [],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      }
    };

    // Run selected tests
    if (includeTests.includes('all') || includeTests.includes('missing-auth')) {
      const authFindings = await AuthTester.testMissingAuth(targetUrl, endpoints || []);
      results.findings.push(...authFindings);
      results.testsRun.push('Missing Authentication Check');
    }

    if (includeTests.includes('all') || includeTests.includes('jwt')) {
      if (authentication?.token) {
        const jwtResults = await AuthTester.analyzeJWT(authentication.token);
        if (jwtResults.vulnerabilities) {
          results.findings.push(...jwtResults.vulnerabilities);
        }
        results.testsRun.push('JWT Analysis');
      }
    }

    if (includeTests.includes('all') || includeTests.includes('cors')) {
      const corsResults = await AuthTester.testCORS(targetUrl);
      results.findings.push(...corsResults.findings || []);
      results.testsRun.push('CORS Configuration');
    }

    if (includeTests.includes('all') || includeTests.includes('rate-limit')) {
      const rateResults = await AuthTester.testRateLimiting({ url: targetUrl, requestCount: 10 });
      if (!rateResults.rateLimitDetected) {
        results.findings.push({
          type: 'NO_RATE_LIMITING',
          severity: 'medium',
          description: 'No rate limiting detected',
          endpoint: targetUrl
        });
      }
      results.testsRun.push('Rate Limiting Check');
    }

    // Calculate summary
    for (const f of results.findings) {
      results.summary[f.severity]++;
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
