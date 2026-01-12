/**
 * Password Checker Service
 * Checks passwords against Have I Been Pwned database and evaluates strength
 */

import crypto from 'crypto';
import { logger } from '../utils/logger.js';

export interface PasswordCheckResult {
  success: boolean;
  pwned: boolean;
  exposure_count: number;
  strength: 'very_weak' | 'weak' | 'fair' | 'strong' | 'very_strong';
  strength_score: number;
  issues: string[];
  recommendations: string[];
  scanned_at: string;
}

interface StrengthAnalysis {
  score: number;
  strength: 'very_weak' | 'weak' | 'fair' | 'strong' | 'very_strong';
  issues: string[];
}

// Common passwords to check against (top 100)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', '12345678', '12345', '1234567', 'password1',
  'qwerty', 'abc123', 'monkey', '1234567890', 'dragon', '111111', 'baseball',
  'iloveyou', 'trustno1', 'sunshine', 'master', '123123', 'welcome', 'shadow',
  'ashley', 'football', 'jesus', 'michael', 'ninja', 'mustang', 'password123',
  'letmein', '654321', 'superman', 'qazwsx', '7777777', 'fuckyou', 'admin',
  'passw0rd', 'login', 'hello', 'starwars', 'charlie', 'donald', 'loveme',
  'zaq12wsx', 'princess', 'access', 'freedom', 'whatever', 'qwerty123', 'solo',
  'passw0rd!', 'admin123', 'administrator', 'changeme', 'root', 'toor', 'pass',
  'test', 'guest', '0000', '1111', '1q2w3e', '1q2w3e4r', '1q2w3e4r5t', 'qwertyuiop',
]);

// Keyboard patterns to detect
const KEYBOARD_PATTERNS = [
  'qwerty', 'asdf', 'zxcv', 'qazwsx', '!@#$%', '12345', '09876', 'poiuy',
  'lkjhg', 'mnbvc', 'qweasd', 'asdzxc', '1qaz', '2wsx', '3edc', '4rfv', '5tgb',
];

// Sequential patterns
const SEQUENTIAL_PATTERNS = [
  'abcdef', 'bcdefg', 'cdefgh', 'defghi', 'efghij', 'fghijk',
  '012345', '123456', '234567', '345678', '456789', '567890',
  'fedcba', '987654', '876543', '765432', '654321', '543210',
];

class PasswordCheckerService {
  /**
   * Check password using Have I Been Pwned k-Anonymity API
   */
  async checkPwned(password: string): Promise<{ pwned: boolean; count: number }> {
    try {
      // Hash the password with SHA-1
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);

      // Query HIBP API with k-Anonymity (only sends first 5 chars of hash)
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: {
          'User-Agent': 'FraudGuard-PasswordChecker/1.0',
        },
      });

      if (!response.ok) {
        logger.warn('HIBP API request failed', { status: response.status });
        return { pwned: false, count: 0 };
      }

      const text = await response.text();
      const lines = text.split('\n');

      // Find matching hash suffix
      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          return { pwned: true, count: parseInt(count.trim(), 10) };
        }
      }

      return { pwned: false, count: 0 };
    } catch (error) {
      logger.error('HIBP password check failed', { error });
      return { pwned: false, count: 0 };
    }
  }

  /**
   * Analyze password strength
   */
  analyzeStrength(password: string): StrengthAnalysis {
    let score = 0;
    const issues: string[] = [];
    const length = password.length;

    // Length scoring (0-30 points)
    if (length >= 8) score += 10;
    if (length >= 12) score += 10;
    if (length >= 16) score += 10;
    if (length < 8) issues.push('Password should be at least 8 characters');
    if (length < 12) issues.push('Use at least 12 characters for better security');

    // Character variety (0-40 points)
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (hasLower) score += 10;
    if (hasUpper) score += 10;
    if (hasDigit) score += 10;
    if (hasSpecial) score += 10;

    if (!hasUpper) issues.push('Add uppercase letters for stronger password');
    if (!hasDigit) issues.push('Add numbers for stronger password');
    if (!hasSpecial) issues.push('Add special characters (!@#$%^&*) for stronger password');

    // Check for common passwords (-30 points)
    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      score -= 30;
      issues.push('This is a commonly used password');
    }

    // Check for keyboard patterns (-15 points each)
    const lowerPassword = password.toLowerCase();
    for (const pattern of KEYBOARD_PATTERNS) {
      if (lowerPassword.includes(pattern)) {
        score -= 15;
        issues.push('Avoid keyboard patterns');
        break;
      }
    }

    // Check for sequential patterns (-15 points each)
    for (const pattern of SEQUENTIAL_PATTERNS) {
      if (lowerPassword.includes(pattern)) {
        score -= 15;
        issues.push('Avoid sequential characters');
        break;
      }
    }

    // Check for repeated characters (-10 points)
    if (/(.)\1{2,}/.test(password)) {
      score -= 10;
      issues.push('Avoid repeated characters');
    }

    // Check for all same case (-5 points)
    if (password === password.toLowerCase() || password === password.toUpperCase()) {
      score -= 5;
      issues.push('Mix uppercase and lowercase letters');
    }

    // Entropy bonus (0-20 points)
    const uniqueChars = new Set(password).size;
    const entropyRatio = uniqueChars / length;
    if (entropyRatio > 0.8) score += 20;
    else if (entropyRatio > 0.6) score += 10;
    else if (entropyRatio > 0.4) score += 5;

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    // Determine strength level
    let strength: 'very_weak' | 'weak' | 'fair' | 'strong' | 'very_strong';
    if (score < 20) strength = 'very_weak';
    else if (score < 40) strength = 'weak';
    else if (score < 60) strength = 'fair';
    else if (score < 80) strength = 'strong';
    else strength = 'very_strong';

    return { score, strength, issues };
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(
    pwned: boolean,
    exposureCount: number,
    strengthAnalysis: StrengthAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (pwned) {
      recommendations.push(
        `This password has appeared in ${exposureCount.toLocaleString()} data breaches`
      );
      recommendations.push('DO NOT use this password - it is known to attackers');
      recommendations.push('Choose a unique password that has never been used before');
    } else {
      recommendations.push('No breaches found for this password');
    }

    // Add strength-based recommendations
    if (strengthAnalysis.strength === 'very_weak' || strengthAnalysis.strength === 'weak') {
      recommendations.push('This password is too weak for secure use');
    }

    // Add specific issues as recommendations
    for (const issue of strengthAnalysis.issues) {
      if (!recommendations.includes(issue)) {
        recommendations.push(issue);
      }
    }

    // General security tips
    if (strengthAnalysis.strength !== 'very_strong') {
      recommendations.push('Consider using a password manager to generate strong passwords');
    }

    return recommendations;
  }

  /**
   * Full password check
   */
  async checkPassword(password: string): Promise<PasswordCheckResult> {
    // Check HIBP
    const { pwned, count } = await this.checkPwned(password);

    // Analyze strength
    const strengthAnalysis = this.analyzeStrength(password);

    // Generate recommendations
    const recommendations = this.generateRecommendations(pwned, count, strengthAnalysis);

    return {
      success: true,
      pwned,
      exposure_count: count,
      strength: strengthAnalysis.strength,
      strength_score: strengthAnalysis.score,
      issues: strengthAnalysis.issues,
      recommendations,
      scanned_at: new Date().toISOString(),
    };
  }
}

export const passwordCheckerService = new PasswordCheckerService();
export default passwordCheckerService;
