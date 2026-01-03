/**
 * SecureCode Analysis Controller
 * Handles code scanning, vulnerability detection, and security analysis
 */

const ScanResult = require('../models/ScanResult.model');
const CodeRepository = require('../models/CodeRepository.model');
const SecurityRule = require('../models/SecurityRule.model');
const sastService = require('../services/sast.service');
const secretsService = require('../services/secrets.service');
const dependenciesService = require('../services/dependencies.service');

/**
 * Run full security scan on code
 */
exports.runFullScan = async (req, res) => {
  try {
    const { 
      code, 
      language, 
      filename,
      repositoryId,
      scanTypes = ['sast', 'secrets', 'dependencies'],
      options = {}
    } = req.body;

    if (!code && !repositoryId) {
      return res.status(400).json({
        success: false,
        error: 'Either code or repositoryId is required'
      });
    }

    const startTime = Date.now();
    const findings = [];
    const scanDetails = {};

    // Get code from repository if repositoryId provided
    let codeToScan = code;
    let detectedLanguage = language;
    let files = [];

    if (repositoryId) {
      const repo = await CodeRepository.findById(repositoryId);
      if (!repo) {
        return res.status(404).json({
          success: false,
          error: 'Repository not found'
        });
      }
      // In real implementation, clone repo and get files
      // For now, we'll use provided code
    }

    // Auto-detect language if not provided
    if (!detectedLanguage && filename) {
      detectedLanguage = detectLanguageFromFilename(filename);
    }

    // Run SAST scan
    if (scanTypes.includes('sast')) {
      const sastResult = await sastService.analyzeCode(codeToScan, {
        language: detectedLanguage,
        filename,
        rules: options.sastRules || 'all',
        severity: options.minSeverity || 'info'
      });
      
      if (sastResult.success) {
        findings.push(...(sastResult.findings || []));
        scanDetails.sast = {
          rulesChecked: sastResult.rulesChecked || 0,
          issuesFound: sastResult.findings?.length || 0,
          duration: sastResult.duration
        };
      }
    }

    // Run secrets scan
    if (scanTypes.includes('secrets')) {
      const secretsResult = await secretsService.scanForSecrets(codeToScan, {
        filename,
        scanType: options.secretsScanType || 'all',
        entropy: options.entropyCheck !== false
      });
      
      if (secretsResult.success) {
        findings.push(...(secretsResult.secrets || []).map(s => ({
          type: 'secret',
          severity: 'critical',
          category: s.type,
          message: s.description || `Potential ${s.type} detected`,
          line: s.line,
          column: s.column,
          code: s.masked,
          rule: s.pattern,
          fix: 'Remove hardcoded secret and use environment variables'
        })));
        scanDetails.secrets = {
          patternsChecked: secretsResult.patternsChecked || 0,
          secretsFound: secretsResult.secrets?.length || 0,
          duration: secretsResult.duration
        };
      }
    }

    // Run dependency scan (if package.json or requirements.txt found)
    if (scanTypes.includes('dependencies') && codeToScan) {
      try {
        // Check if code contains dependency manifest
        if (codeToScan.includes('"dependencies"') || 
            codeToScan.includes('require(') ||
            filename?.endsWith('package.json')) {
          const depsResult = await dependenciesService.scanPackageJson(
            filename?.endsWith('package.json') ? codeToScan : null
          );
          
          if (depsResult.success && depsResult.vulnerabilities) {
            findings.push(...depsResult.vulnerabilities.map(v => ({
              type: 'dependency',
              severity: v.severity,
              category: 'Vulnerable Dependency',
              message: `${v.package}@${v.version}: ${v.title}`,
              package: v.package,
              version: v.version,
              cve: v.cve,
              fix: v.recommendation
            })));
            scanDetails.dependencies = {
              packagesScanned: depsResult.summary?.total || 0,
              vulnerabilitiesFound: depsResult.vulnerabilities?.length || 0,
              duration: depsResult.duration
            };
          }
        }
      } catch (depError) {
        console.warn('Dependency scan warning:', depError.message);
      }
    }

    // Calculate severity counts
    const severityCounts = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      info: findings.filter(f => f.severity === 'info').length
    };

    // Calculate security score
    const securityScore = calculateSecurityScore(severityCounts, codeToScan?.length || 0);

    // Determine overall risk level
    const riskLevel = determineRiskLevel(severityCounts);

    const scanDuration = Date.now() - startTime;

    // Save scan result to database
    const scanResult = new ScanResult({
      repository: repositoryId,
      scanType: 'full',
      status: 'completed',
      triggeredBy: req.user?.id || 'anonymous',
      findings: findings.map(f => ({
        ruleId: f.rule || 'unknown',
        severity: f.severity,
        category: f.category,
        message: f.message,
        file: filename,
        line: f.line,
        column: f.column,
        codeSnippet: f.code,
        suggestedFix: f.fix,
        cweId: f.cwe,
        owaspCategory: f.owasp
      })),
      summary: {
        totalFindings: findings.length,
        ...severityCounts,
        filesScanned: 1,
        linesOfCode: codeToScan?.split('\n').length || 0
      },
      securityScore,
      duration: scanDuration,
      completedAt: new Date()
    });

    await scanResult.save();

    res.json({
      success: true,
      data: {
        scanId: scanResult._id,
        riskLevel,
        securityScore,
        summary: {
          totalFindings: findings.length,
          ...severityCounts
        },
        findings: findings.slice(0, 100), // Limit response size
        scanDetails,
        duration: scanDuration,
        language: detectedLanguage
      }
    });

  } catch (error) {
    console.error('Full scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Run SAST-only scan
 */
exports.runSastScan = async (req, res) => {
  try {
    const { code, language, filename, options = {} } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }

    const result = await sastService.analyzeCode(code, {
      language: language || detectLanguageFromFilename(filename),
      filename,
      rules: options.rules || 'all',
      severity: options.minSeverity || 'info',
      includeContext: options.includeContext !== false
    });

    res.json({
      success: true,
      data: {
        findings: result.findings || [],
        rulesChecked: result.rulesChecked || 0,
        duration: result.duration,
        language: result.language
      }
    });

  } catch (error) {
    console.error('SAST scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Run secrets-only scan
 */
exports.runSecretsScan = async (req, res) => {
  try {
    const { code, filename, options = {} } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Code is required'
      });
    }

    const result = await secretsService.scanForSecrets(code, {
      filename,
      scanType: options.scanType || 'all',
      entropy: options.entropy !== false,
      verify: options.verify || false
    });

    res.json({
      success: true,
      data: {
        secrets: result.secrets || [],
        patternsChecked: result.patternsChecked || 0,
        highEntropyStrings: result.highEntropyStrings || [],
        duration: result.duration
      }
    });

  } catch (error) {
    console.error('Secrets scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Run dependency vulnerability scan
 */
exports.runDependencyScan = async (req, res) => {
  try {
    const { packageJson, requirementsTxt, ecosystem, options = {} } = req.body;

    let result;

    if (packageJson) {
      result = await dependenciesService.scanPackageJson(
        typeof packageJson === 'string' ? packageJson : JSON.stringify(packageJson)
      );
    } else if (requirementsTxt) {
      result = await dependenciesService.scanRequirementsTxt(requirementsTxt);
    } else if (ecosystem) {
      // Scan current project based on ecosystem
      result = await dependenciesService.scanProject(process.cwd(), ecosystem);
    } else {
      return res.status(400).json({
        success: false,
        error: 'packageJson, requirementsTxt, or ecosystem is required'
      });
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Dependency scan error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get AI-powered fix suggestions
 */
exports.getFixSuggestions = async (req, res) => {
  try {
    const { code, finding, language } = req.body;

    if (!code || !finding) {
      return res.status(400).json({
        success: false,
        error: 'Code and finding are required'
      });
    }

    const suggestions = await sastService.getFixSuggestions(code, finding, language);

    res.json({
      success: true,
      data: {
        suggestions,
        finding
      }
    });

  } catch (error) {
    console.error('Fix suggestions error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get security rules
 */
exports.getSecurityRules = async (req, res) => {
  try {
    const { language, category, severity, enabled } = req.query;

    const filter = {};
    if (language) filter.language = language;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (enabled !== undefined) filter.isEnabled = enabled === 'true';

    const rules = await SecurityRule.find(filter)
      .sort({ severity: 1, category: 1 })
      .limit(200);

    res.json({
      success: true,
      data: {
        rules,
        total: rules.length
      }
    });

  } catch (error) {
    console.error('Get rules error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Create custom security rule
 */
exports.createSecurityRule = async (req, res) => {
  try {
    const ruleData = req.body;

    const rule = new SecurityRule({
      ...ruleData,
      isCustom: true,
      createdBy: req.user?.id
    });

    await rule.save();

    res.status(201).json({
      success: true,
      data: rule
    });

  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get scan history
 */
exports.getScanHistory = async (req, res) => {
  try {
    const { repositoryId, limit = 20, offset = 0 } = req.query;

    const filter = {};
    if (repositoryId) filter.repository = repositoryId;

    const scans = await ScanResult.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .select('-findings'); // Exclude large findings array for list view

    const total = await ScanResult.countDocuments(filter);

    res.json({
      success: true,
      data: {
        scans,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get scan result by ID
 */
exports.getScanResult = async (req, res) => {
  try {
    const { id } = req.params;

    const scan = await ScanResult.findById(id)
      .populate('repository', 'name url');

    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan result not found'
      });
    }

    res.json({
      success: true,
      data: scan
    });

  } catch (error) {
    console.error('Get scan result error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get analysis statistics
 */
exports.getStats = async (req, res) => {
  try {
    const [
      totalScans,
      recentScans,
      findingsAgg,
      ruleStats
    ] = await Promise.all([
      ScanResult.countDocuments(),
      ScanResult.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .select('securityScore summary duration'),
      ScanResult.aggregate([
        {
          $group: {
            _id: null,
            totalFindings: { $sum: '$summary.totalFindings' },
            criticalFindings: { $sum: '$summary.critical' },
            avgScore: { $avg: '$securityScore' }
          }
        }
      ]),
      SecurityRule.countDocuments({ isEnabled: true })
    ]);

    const stats = findingsAgg[0] || { totalFindings: 0, criticalFindings: 0, avgScore: 0 };

    res.json({
      success: true,
      data: {
        totalScans,
        totalFindings: stats.totalFindings,
        criticalFindings: stats.criticalFindings,
        averageScore: Math.round(stats.avgScore || 0),
        activeRules: ruleStats,
        recentActivity: recentScans.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper functions

function detectLanguageFromFilename(filename) {
  if (!filename) return 'javascript';
  
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cs': 'csharp',
    'go': 'go',
    'rb': 'ruby',
    'php': 'php',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'ps1': 'powershell',
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css'
  };
  
  return langMap[ext] || 'plaintext';
}

function calculateSecurityScore(severityCounts, codeLength) {
  // Start with 100 and deduct based on findings
  let score = 100;
  
  score -= severityCounts.critical * 15;
  score -= severityCounts.high * 8;
  score -= severityCounts.medium * 4;
  score -= severityCounts.low * 1;
  
  // Normalize based on code size (larger codebases get slight leniency)
  const sizeBonus = Math.min(5, Math.floor(codeLength / 10000));
  score += sizeBonus;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function determineRiskLevel(severityCounts) {
  if (severityCounts.critical > 0) return 'CRITICAL';
  if (severityCounts.high >= 3) return 'HIGH';
  if (severityCounts.high > 0 || severityCounts.medium >= 5) return 'MEDIUM';
  if (severityCounts.medium > 0 || severityCounts.low >= 5) return 'LOW';
  return 'SAFE';
}

module.exports = exports;
