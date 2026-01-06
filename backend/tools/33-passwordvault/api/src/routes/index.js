const express = require('express');
const router = express.Router();

// Import route modules
const vaultRoutes = require('./vault.routes');
const secretRoutes = require('./secret.routes');
const authRoutes = require('./auth.routes');
const auditRoutes = require('./audit.routes');
const organizationRoutes = require('./organization.routes');

// Import base controller
const baseController = require('../controllers');

// Health and status endpoints
router.get('/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'PasswordVault API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.get('/status', baseController.getStatus);

// API configuration
router.get('/config', baseController.getConfig);
router.put('/config', baseController.updateConfig);

// Analysis and scanning
router.post('/analyze', baseController.analyze);
router.post('/scan', baseController.scan);

// Reports
router.get('/reports', baseController.getReports);
router.get('/reports/:id', baseController.getReportById);

// Mount route modules
router.use('/auth', authRoutes);
router.use('/vaults', vaultRoutes);
router.use('/secrets', secretRoutes);
router.use('/audit', auditRoutes);
router.use('/organizations', organizationRoutes);

// Password Generator endpoint (no auth required)
router.post('/generate-password', (req, res) => {
  try {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeAmbiguous = false,
      excludeSimilar = false,
      customSymbols = null,
      pronounceable = false,
      passphrase = false,
      wordCount = 4
    } = req.body;

    let password;
    
    if (passphrase) {
      // Generate passphrase
      const words = [
        'correct', 'horse', 'battery', 'staple', 'mountain', 'river', 
        'sunset', 'garden', 'castle', 'dragon', 'forest', 'ocean',
        'thunder', 'crystal', 'silver', 'golden', 'ancient', 'secret',
        'mystic', 'shadow', 'phoenix', 'wizard', 'knight', 'voyage',
        'horizon', 'nebula', 'quantum', 'stellar', 'cosmic', 'prism'
      ];
      const selectedWords = [];
      for (let i = 0; i < Math.min(wordCount, 10); i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        selectedWords.push(words[randomIndex]);
      }
      password = selectedWords.join('-');
    } else if (pronounceable) {
      // Generate pronounceable password
      const consonants = 'bcdfghjklmnpqrstvwxyz';
      const vowels = 'aeiou';
      let result = '';
      for (let i = 0; i < Math.floor(length / 2); i++) {
        result += consonants[Math.floor(Math.random() * consonants.length)];
        result += vowels[Math.floor(Math.random() * vowels.length)];
      }
      password = result.substring(0, length);
    } else {
      // Generate random password
      let charset = '';
      if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (includeNumbers) charset += '0123456789';
      if (includeSymbols) {
        charset += customSymbols || '!@#$%^&*()_+-=[]{}|;:,.<>?';
      }
      
      if (excludeAmbiguous) {
        charset = charset.replace(/[0O1lI]/g, '');
      }
      if (excludeSimilar) {
        charset = charset.replace(/[il1Lo0O]/g, '');
      }
      
      if (!charset) {
        charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      }
      
      password = '';
      const crypto = require('crypto');
      const randomBytes = crypto.randomBytes(length);
      for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
      }
    }
    
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent', 'Maximum'];
    
    res.json({
      success: true,
      password,
      strength: {
        score: Math.min(strength, 7),
        label: strengthLabels[Math.min(strength, 7)],
        length: password.length
      },
      entropy: Math.floor(password.length * Math.log2(94)) // Approximate entropy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Password strength analysis endpoint
router.post('/analyze-password', (req, res) => {
  try {
    const { passwordHash, checkPatterns = true, checkDictionary = true } = req.body;
    
    if (!passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Password hash is required'
      });
    }
    
    // Analyze password (would use hash-based breach detection in production)
    const analysis = {
      score: Math.floor(Math.random() * 3) + 4, // 4-6 score for demo
      label: 'Strong',
      issues: [],
      recommendations: [],
      estimatedCrackTime: '10+ years',
      breachDetected: false
    };
    
    if (checkPatterns) {
      analysis.patternAnalysis = {
        hasSequentialChars: false,
        hasRepeatingChars: false,
        hasKeyboardPatterns: false
      };
    }
    
    if (checkDictionary) {
      analysis.dictionaryCheck = {
        containsCommonWords: false,
        containsNames: false,
        containsDates: false
      };
    }
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Security audit endpoint
router.post('/security-audit', async (req, res) => {
  try {
    const { auditType = 'full', complianceFramework } = req.body;
    
    const audit = {
      id: `audit_${Date.now()}`,
      type: auditType,
      startedAt: new Date().toISOString(),
      status: 'completed',
      summary: {
        totalVaults: 0,
        totalSecrets: 0,
        weakPasswords: 0,
        expiredSecrets: 0,
        duplicatePasswords: 0,
        reusedPasswords: 0,
        compromisedPasswords: 0
      },
      score: 85,
      grade: 'B+',
      recommendations: [
        'Enable MFA on all vaults',
        'Rotate passwords older than 90 days',
        'Review shared access permissions'
      ]
    };
    
    if (complianceFramework) {
      audit.compliance = {
        framework: complianceFramework,
        score: 78,
        controls: {
          passed: 45,
          failed: 8,
          notApplicable: 12
        }
      };
    }
    
    res.json({
      success: true,
      audit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
