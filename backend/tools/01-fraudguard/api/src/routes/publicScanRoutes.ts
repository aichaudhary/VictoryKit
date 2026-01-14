/**
 * Public Scanner Routes
 * /api/scan/* endpoints for public security scanning
 */

import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';
import { scanURL } from '../services/urlScanner.js';
import { checkEmail, checkPassword } from '../services/emailChecker.js';
import { validatePhone } from '../services/phoneValidator.js';
import { checkIP } from '../services/ipChecker.js';
import ScanResult from '../models/ScanResult.js';

const router = Router();

// Rate limiters for each endpoint
const urlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { error: 'Too many URL scans. Please try again later.', retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // 5 requests per minute
  message: { error: 'Too many email checks. Please try again later.', retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

const phoneLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many phone validations. Please try again later.', retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

const ipLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many IP checks. Please try again later.', retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many password checks. Please try again later.', retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

const historyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many history requests. Please try again later.', retry_after: 60 },
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper to get client IP
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || 'unknown';
}

/**
 * @route   POST /api/scan/url
 * @desc    Scan a URL for threats
 * @access  Public
 */
router.post('/url', urlLimiter, async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        message: 'Please provide a URL to scan',
      });
    }
    
    // Basic URL validation
    if (typeof url !== 'string' || url.length > 2048) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL',
        message: 'URL must be a string with maximum 2048 characters',
      });
    }
    
    const clientIP = getClientIP(req);
    logger.info(`URL scan request from ${clientIP}: ${url.substring(0, 100)}`);
    
    const result = await scanURL(url, clientIP);
    
    return res.json(result);
    
  } catch (error: any) {
    logger.error('URL scan error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Scan failed',
      message: 'An error occurred while scanning the URL. Please try again.',
    });
  }
});

/**
 * @route   POST /api/scan/email
 * @desc    Check email for breaches
 * @access  Public
 */
router.post('/email', emailLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
        message: 'Please provide an email address to check',
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email',
        message: 'Please provide a valid email address',
      });
    }
    
    const clientIP = getClientIP(req);
    logger.info(`Email check request from ${clientIP}: ${email}`);
    
    const result = await checkEmail(email, clientIP);
    
    return res.json(result);
    
  } catch (error: any) {
    logger.error('Email check error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Check failed',
      message: 'An error occurred while checking the email. Please try again.',
    });
  }
});

/**
 * @route   POST /api/scan/phone
 * @desc    Validate phone number
 * @access  Public
 */
router.post('/phone', phoneLimiter, async (req: Request, res: Response) => {
  try {
    const { phone, country } = req.body;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required',
        message: 'Please provide a phone number to validate',
      });
    }
    
    // Basic phone validation
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number',
        message: 'Phone number should have between 7 and 15 digits',
      });
    }
    
    const clientIP = getClientIP(req);
    logger.info(`Phone validation request from ${clientIP}: ${phone}`);
    
    const result = await validatePhone(phone, clientIP);
    
    return res.json(result);
    
  } catch (error: any) {
    logger.error('Phone validation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Validation failed',
      message: 'An error occurred while validating the phone. Please try again.',
    });
  }
});

/**
 * @route   POST /api/scan/ip
 * @desc    Check IP reputation
 * @access  Public
 */
router.post('/ip', ipLimiter, async (req: Request, res: Response) => {
  try {
    const { ip } = req.body;
    
    // If no IP provided, check the client's own IP
    const targetIP = ip || getClientIP(req);
    
    // Basic IP validation
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (!ipv4Regex.test(targetIP) && !ipv6Regex.test(targetIP)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IP address',
        message: 'Please provide a valid IPv4 or IPv6 address',
      });
    }
    
    const clientIP = getClientIP(req);
    logger.info(`IP check request from ${clientIP}: ${targetIP}`);
    
    const result = await checkIP(targetIP, clientIP);
    
    return res.json(result);
    
  } catch (error: any) {
    logger.error('IP check error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Check failed',
      message: 'An error occurred while checking the IP. Please try again.',
    });
  }
});

/**
 * @route   POST /api/scan/password
 * @desc    Check password security
 * @access  Public
 */
router.post('/password', passwordLimiter, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required',
        message: 'Please provide a password to check',
      });
    }
    
    if (typeof password !== 'string' || password.length > 128) {
      return res.status(400).json({
        success: false,
        error: 'Invalid password',
        message: 'Password must be a string with maximum 128 characters',
      });
    }
    
    const clientIP = getClientIP(req);
    logger.info(`Password check request from ${clientIP}`);
    
    const result = await checkPassword(password);
    
    // Don't log the password itself, just the result
    logger.info(`Password check complete - pwned: ${result.pwned}, strength: ${result.strength}`);
    
    return res.json({
      success: result.success,
      // Never return the password
      pwned: result.pwned,
      exposure_count: result.count,
      strength: result.strength,
      recommendations: result.recommendations,
      scanned_at: new Date(),
    });
    
  } catch (error: any) {
    logger.error('Password check error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Check failed',
      message: 'An error occurred while checking the password. Please try again.',
    });
  }
});

/**
 * @route   GET /api/scan/history
 * @desc    Get recent scans for client IP
 * @access  Public
 */
router.get('/history', historyLimiter, async (req: Request, res: Response) => {
  try {
    const clientIP = getClientIP(req);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const scanType = req.query.type as string;
    
    logger.info(`History request from ${clientIP}`);
    
    // Build query
    const query: any = { client_ip: clientIP };
    if (scanType && ['url', 'email', 'phone', 'ip'].includes(scanType)) {
      query.scan_type = scanType;
    }
    
    const scans = await ScanResult.find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .select('-client_ip -__v');
    
    return res.json({
      success: true,
      count: scans.length,
      scans: scans.map(scan => ({
        scan_id: scan.scan_id,
        scan_type: scan.scan_type,
        input: scan.scan_type === 'password' ? '********' : scan.input,
        verdict: scan.result.verdict,
        risk_score: scan.result.risk_score,
        risk_level: scan.result.risk_level,
        scanned_at: scan.created_at,
      })),
    });
    
  } catch (error: any) {
    logger.error('History fetch error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching history. Please try again.',
    });
  }
});

/**
 * @route   GET /api/scan/:scan_id
 * @desc    Get details of a specific scan
 * @access  Public
 */
router.get('/:scan_id', async (req: Request, res: Response) => {
  try {
    const { scan_id } = req.params;
    const clientIP = getClientIP(req);
    
    const scan = await ScanResult.findOne({ scan_id })
      .select('-__v');
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        error: 'Scan not found',
        message: 'The requested scan result was not found or has expired',
      });
    }
    
    // Only allow access to own scans
    if (scan.client_ip !== clientIP) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view your own scan results',
      });
    }
    
    return res.json({
      success: true,
      scan: {
        scan_id: scan.scan_id,
        scan_type: scan.scan_type,
        input: scan.scan_type === 'password' ? '********' : scan.input,
        result: scan.result,
        sources: scan.sources,
        scanned_at: scan.created_at,
      },
    });
    
  } catch (error: any) {
    logger.error('Scan fetch error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching the scan. Please try again.',
    });
  }
});

/**
 * @route   GET /api/scan/stats/summary
 * @desc    Get scan statistics (last 24h)
 * @access  Public
 */
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const timeRange = (req.query.range as string) || '24h';
    
    // Use static method from model
    const stats = await (ScanResult as any).getStats(timeRange);
    
    return res.json({
      success: true,
      time_range: timeRange,
      stats: {
        total_scans: stats.total_scans,
        by_type: {
          url: stats.url_scans,
          email: stats.email_scans,
          phone: stats.phone_scans,
          ip: stats.ip_scans,
        },
        by_verdict: {
          safe: stats.safe_count,
          suspicious: stats.suspicious_count,
          malicious: stats.malicious_count,
        },
        average_risk_score: Math.round(stats.avg_risk_score || 0),
        detection_rate: stats.total_scans > 0
          ? Math.round(((stats.malicious_count + stats.suspicious_count) / stats.total_scans) * 100)
          : 0,
      },
    });
    
  } catch (error: any) {
    logger.error('Stats fetch error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Fetch failed',
      message: 'An error occurred while fetching statistics.',
    });
  }
});

export default router;
