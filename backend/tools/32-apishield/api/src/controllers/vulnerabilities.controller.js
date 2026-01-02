const { APIVulnerability, APIScan } = require('../models');

// Get all vulnerabilities
exports.getVulnerabilities = async (req, res) => {
  try {
    const { 
      scanId, 
      severity, 
      type, 
      status,
      limit = 50, 
      page = 1 
    } = req.query;

    const query = {};
    if (scanId) query.scanId = scanId;
    if (severity) query.severity = severity;
    if (type) query.type = type;
    if (status) query.status = status;

    const vulnerabilities = await APIVulnerability.find(query)
      .populate('endpointId', 'method path')
      .sort({ severity: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await APIVulnerability.countDocuments(query);

    res.json({
      success: true,
      data: {
        vulnerabilities,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single vulnerability
exports.getVulnerability = async (req, res) => {
  try {
    const vuln = await APIVulnerability.findById(req.params.id)
      .populate('endpointId')
      .populate('scanId', 'name targetUrl');

    if (!vuln) {
      return res.status(404).json({
        success: false,
        error: 'Vulnerability not found'
      });
    }

    res.json({
      success: true,
      data: { vulnerability: vuln }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update vulnerability status
exports.updateVulnerabilityStatus = async (req, res) => {
  try {
    const { status, confirmedBy, notes } = req.body;
    
    const vuln = await APIVulnerability.findById(req.params.id);
    if (!vuln) {
      return res.status(404).json({
        success: false,
        error: 'Vulnerability not found'
      });
    }

    vuln.status = status;
    if (status === 'confirmed') {
      vuln.confirmedAt = new Date();
      vuln.confirmedBy = confirmedBy;
    } else if (status === 'fixed') {
      vuln.fixedAt = new Date();
    }

    await vuln.save();

    res.json({
      success: true,
      data: { vulnerability: vuln }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get vulnerability statistics
exports.getVulnerabilityStats = async (req, res) => {
  try {
    const { scanId, specId } = req.query;
    const match = {};
    if (scanId) match.scanId = scanId;
    if (specId) match.specId = specId;

    const bySeverity = await APIVulnerability.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    const byType = await APIVulnerability.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          severity: { $first: '$severity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const byStatus = await APIVulnerability.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const byOWASP = await APIVulnerability.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$owaspCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format results
    const severityStats = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    bySeverity.forEach(s => { severityStats[s._id] = s.count; });

    const statusStats = { open: 0, confirmed: 0, 'false-positive': 0, fixed: 0 };
    byStatus.forEach(s => { if (statusStats[s._id] !== undefined) statusStats[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        bySeverity: severityStats,
        byType: byType.map(t => ({ type: t._id, count: t.count, severity: t.severity })),
        byStatus: statusStats,
        byOWASP: byOWASP.filter(o => o._id).map(o => ({ category: o._id, count: o.count })),
        total: Object.values(severityStats).reduce((a, b) => a + b, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get remediation code for vulnerability
exports.getRemediationCode = async (req, res) => {
  try {
    const vuln = await APIVulnerability.findById(req.params.id);
    if (!vuln) {
      return res.status(404).json({
        success: false,
        error: 'Vulnerability not found'
      });
    }

    // Generate remediation based on type
    const remediation = generateRemediation(vuln);

    res.json({
      success: true,
      data: {
        vulnerability: {
          type: vuln.type,
          severity: vuln.severity,
          cweId: vuln.cweId
        },
        remediation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

function generateRemediation(vuln) {
  const remediations = {
    'SQL_INJECTION': {
      recommendation: 'Use parameterized queries or prepared statements. Never concatenate user input into SQL queries.',
      code: {
        language: 'javascript',
        code: `// Bad - vulnerable to SQL injection
const query = "SELECT * FROM users WHERE id = " + userId;

// Good - parameterized query
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);

// Or with an ORM like Mongoose
User.findById(userId);`
      },
      references: [
        'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
        'https://cwe.mitre.org/data/definitions/89.html'
      ]
    },
    'BOLA': {
      recommendation: 'Implement proper authorization checks. Verify the authenticated user has access to the requested resource.',
      code: {
        language: 'javascript',
        code: `// Middleware to check resource ownership
const checkOwnership = async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);
  
  if (!resource) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  if (resource.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  req.resource = resource;
  next();
};

app.get('/api/resources/:id', authenticate, checkOwnership, getResource);`
      },
      references: [
        'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/'
      ]
    },
    'NO_RATE_LIMITING': {
      recommendation: 'Implement rate limiting on all endpoints, especially authentication and resource-intensive operations.',
      code: {
        language: 'javascript',
        code: `const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' }
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 failed attempts per hour
  message: { error: 'Too many login attempts' }
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);`
      },
      references: [
        'https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/'
      ]
    },
    'JWT_VULNERABILITY': {
      recommendation: 'Validate JWT algorithm, use strong secrets, and implement proper token expiration.',
      code: {
        language: 'javascript',
        code: `const jwt = require('jsonwebtoken');

// Always specify the algorithm explicitly
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'], // Explicitly allow only HS256
    issuer: 'your-app',
    audience: 'your-api'
  });
};

// Short-lived access tokens with refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '15m', algorithm: 'HS256' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
  
  return { accessToken, refreshToken };
};`
      },
      references: [
        'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html'
      ]
    }
  };

  return remediations[vuln.type] || {
    recommendation: vuln.recommendation || 'Review and fix the identified vulnerability.',
    code: vuln.remediationCode || null,
    references: vuln.references || []
  };
}
