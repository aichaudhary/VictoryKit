/**
 * Email Checker Service
 * Check emails for breaches, reputation, and security
 */

import { hibp, ipQualityScore } from './externalAPIs.js';
import { logger } from '../utils/logger.js';
import ScanResult from '../models/ScanResult.js';
import crypto from 'crypto';

export interface EmailCheckResult {
  success: boolean;
  scan_id: string;
  email: string;
  is_breached: boolean;
  breach_count: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  breaches: BreachInfo[];
  pastes: PasteInfo[];
  reputation: EmailReputation;
  recommendations: string[];
  sources: string[];
  scanned_at: Date;
}

export interface BreachInfo {
  name: string;
  title: string;
  domain: string;
  date: string;
  added_date?: string;
  compromised_data: string[];
  description?: string;
  is_verified: boolean;
  is_sensitive: boolean;
  pwn_count?: number;
}

export interface PasteInfo {
  source: string;
  id: string;
  title?: string;
  date: string;
  email_count?: number;
}

export interface EmailReputation {
  valid: boolean;
  disposable: boolean;
  deliverability: string;
  smtp_score: number;
  fraud_score: number;
  honeypot: boolean;
  spam_trap: boolean;
  recent_abuse: boolean;
  leaked: boolean;
  domain_age?: string;
  first_seen?: string;
  suggested_domain?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Generate scan ID
function generateScanId(): string {
  return `scan_${crypto.randomBytes(8).toString('hex')}`;
}

// Determine risk level based on breaches and reputation
function calculateRiskLevel(
  breachCount: number,
  reputation: EmailReputation | null
): 'low' | 'medium' | 'high' | 'critical' {
  let riskPoints = 0;
  
  // Breach count contribution
  if (breachCount === 0) riskPoints += 0;
  else if (breachCount <= 2) riskPoints += 25;
  else if (breachCount <= 5) riskPoints += 50;
  else if (breachCount <= 10) riskPoints += 75;
  else riskPoints += 100;
  
  // Reputation contribution
  if (reputation) {
    if (reputation.disposable) riskPoints += 30;
    if (reputation.honeypot) riskPoints += 50;
    if (reputation.spam_trap) riskPoints += 40;
    if (reputation.recent_abuse) riskPoints += 30;
    if (reputation.leaked) riskPoints += 20;
    if (reputation.fraud_score > 75) riskPoints += 40;
    else if (reputation.fraud_score > 50) riskPoints += 20;
    if (!reputation.valid) riskPoints += 20;
  }
  
  // Normalize to 100
  riskPoints = Math.min(100, riskPoints);
  
  if (riskPoints < 25) return 'low';
  if (riskPoints < 50) return 'medium';
  if (riskPoints < 75) return 'high';
  return 'critical';
}

// Generate recommendations
function generateRecommendations(
  breachCount: number,
  breaches: BreachInfo[],
  reputation: EmailReputation | null
): string[] {
  const recommendations: string[] = [];
  
  if (breachCount > 0) {
    recommendations.push('Change passwords for all affected services immediately');
    recommendations.push('Enable two-factor authentication (2FA) on all accounts');
    recommendations.push('Monitor your accounts for unauthorized access');
    recommendations.push('Consider using a password manager for unique passwords');
    
    // Check for sensitive breaches
    const sensitiveBreaches = breaches.filter(b => b.is_sensitive);
    if (sensitiveBreaches.length > 0) {
      recommendations.push('Your email was found in sensitive breaches - take extra precautions');
    }
    
    // Check for password leaks
    const passwordLeaks = breaches.filter(b => 
      b.compromised_data.some(d => d.toLowerCase().includes('password'))
    );
    if (passwordLeaks.length > 0) {
      recommendations.push(`Your password was exposed in ${passwordLeaks.length} breach(es) - change all passwords using this email`);
    }
    
    // Check for recent breaches (last 2 years)
    const recentBreaches = breaches.filter(b => {
      const breachDate = new Date(b.date);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      return breachDate >= twoYearsAgo;
    });
    if (recentBreaches.length > 0) {
      recommendations.push(`${recentBreaches.length} recent breach(es) found - take immediate action`);
    }
  } else {
    recommendations.push('No breaches found for this email');
    recommendations.push('Continue using strong, unique passwords for each service');
    recommendations.push('Enable two-factor authentication where available');
  }
  
  // Reputation-based recommendations
  if (reputation) {
    if (reputation.disposable) {
      recommendations.push('This appears to be a disposable email address');
    }
    if (!reputation.valid) {
      recommendations.push('This email address may not be valid or deliverable');
    }
    if (reputation.suggested_domain) {
      recommendations.push(`Did you mean: ${reputation.suggested_domain}?`);
    }
    if (reputation.recent_abuse) {
      recommendations.push('This email has been associated with recent abuse activity');
    }
  }
  
  return recommendations;
}

/**
 * Main email check function
 */
export async function checkEmail(email: string, clientIP: string): Promise<EmailCheckResult> {
  const scan_id = generateScanId();
  const sources: string[] = [];
  
  logger.info(`Starting email check: ${email} (${scan_id})`);
  
  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return {
      success: false,
      scan_id,
      email,
      is_breached: false,
      breach_count: 0,
      risk_level: 'low',
      breaches: [],
      pastes: [],
      reputation: {
        valid: false,
        disposable: false,
        deliverability: 'unknown',
        smtp_score: 0,
        fraud_score: 0,
        honeypot: false,
        spam_trap: false,
        recent_abuse: false,
        leaked: false,
      },
      recommendations: ['Invalid email format provided'],
      sources: [],
      scanned_at: new Date(),
    };
  }
  
  try {
    // Run all checks in parallel
    const [hibpBreaches, hibpPastes, ipqsEmail] = await Promise.allSettled([
      hibp.checkBreaches(email),
      hibp.checkPastes(email),
      ipQualityScore.checkEmail(email),
    ]);
    
    // Process HIBP breach results
    let breaches: BreachInfo[] = [];
    if (hibpBreaches.status === 'fulfilled' && hibpBreaches.value.success) {
      sources.push('Have I Been Pwned');
      breaches = hibpBreaches.value.breaches.map((b: any) => ({
        name: b.name,
        title: b.title,
        domain: b.domain || '',
        date: b.date,
        added_date: b.addedDate,
        compromised_data: b.dataClasses || [],
        description: b.description,
        is_verified: b.isVerified,
        is_sensitive: b.isSensitive,
        pwn_count: b.pwnCount,
      }));
    }
    
    // Process HIBP paste results
    let pastes: PasteInfo[] = [];
    if (hibpPastes.status === 'fulfilled' && hibpPastes.value.success) {
      pastes = (hibpPastes.value.pastes || []).map((p: any) => ({
        source: p.Source,
        id: p.Id,
        title: p.Title,
        date: p.Date,
        email_count: p.EmailCount,
      }));
    }
    
    // Process IPQualityScore email reputation
    let reputation: EmailReputation = {
      valid: true,
      disposable: false,
      deliverability: 'unknown',
      smtp_score: 0,
      fraud_score: 0,
      honeypot: false,
      spam_trap: false,
      recent_abuse: false,
      leaked: false,
    };
    
    if (ipqsEmail.status === 'fulfilled' && ipqsEmail.value.success) {
      sources.push('IPQualityScore');
      const ipqs = ipqsEmail.value;
      reputation = {
        valid: ipqs.valid !== false,
        disposable: ipqs.disposable || false,
        deliverability: ipqs.deliverability || 'unknown',
        smtp_score: ipqs.smtpScore || 0,
        fraud_score: ipqs.fraudScore || 0,
        honeypot: ipqs.honeypot || false,
        spam_trap: ipqs.spamTrapScore > 50,
        recent_abuse: ipqs.recentAbuse || false,
        leaked: ipqs.leaked || false,
        domain_age: ipqs.domainAge ? `${ipqs.domainAge.human}` : undefined,
        first_seen: ipqs.firstSeen ? `${ipqs.firstSeen.human}` : undefined,
        suggested_domain: ipqs.suggestedDomain || undefined,
      };
    }
    
    // Calculate risk level
    const riskLevel = calculateRiskLevel(breaches.length, reputation);
    
    // Generate recommendations
    const recommendations = generateRecommendations(breaches.length, breaches, reputation);
    
    // Create result
    const result: EmailCheckResult = {
      success: true,
      scan_id,
      email,
      is_breached: breaches.length > 0,
      breach_count: breaches.length,
      risk_level: riskLevel,
      breaches: breaches.slice(0, 20), // Limit to 20 breaches for response size
      pastes: pastes.slice(0, 10), // Limit to 10 pastes
      reputation,
      recommendations,
      sources,
      scanned_at: new Date(),
    };
    
    // Save scan result
    await ScanResult.create({
      scan_id,
      scan_type: 'email',
      input: email,
      result: {
        verdict: riskLevel === 'critical' || riskLevel === 'high' ? 'malicious' : 
                 riskLevel === 'medium' ? 'suspicious' : 'safe',
        risk_score: riskLevel === 'critical' ? 90 : 
                    riskLevel === 'high' ? 70 : 
                    riskLevel === 'medium' ? 40 : 10,
        risk_level: riskLevel,
        threats: breaches.map(b => ({
          type: 'breach',
          description: `Found in ${b.name} breach`,
          confidence: b.is_verified ? 95 : 70,
          source: 'Have I Been Pwned',
          severity: b.is_sensitive ? 'critical' : 'high',
        })),
        details: {
          breach_count: breaches.length,
          paste_count: pastes.length,
          reputation,
        },
        recommendations,
      },
      sources,
      client_ip: clientIP,
      expires_at: new Date(Date.now() + 3600000), // 1 hour
    });
    
    logger.info(`Email check complete: ${email} - ${breaches.length} breaches found`);
    return result;
    
  } catch (error: any) {
    logger.error(`Email check error: ${error.message}`);
    return {
      success: false,
      scan_id,
      email,
      is_breached: false,
      breach_count: 0,
      risk_level: 'low',
      breaches: [],
      pastes: [],
      reputation: {
        valid: true,
        disposable: false,
        deliverability: 'unknown',
        smtp_score: 0,
        fraud_score: 0,
        honeypot: false,
        spam_trap: false,
        recent_abuse: false,
        leaked: false,
      },
      recommendations: ['Unable to complete check. Please try again later.'],
      sources: [],
      scanned_at: new Date(),
    };
  }
}

/**
 * Check password against breached passwords
 */
export async function checkPassword(password: string): Promise<{
  success: boolean;
  pwned: boolean;
  count: number;
  strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  recommendations: string[];
}> {
  try {
    // Check against HIBP
    const hibpResult = await hibp.checkPassword(password);
    
    // Calculate password strength
    let strengthPoints = 0;
    if (password.length >= 8) strengthPoints += 1;
    if (password.length >= 12) strengthPoints += 1;
    if (password.length >= 16) strengthPoints += 1;
    if (/[a-z]/.test(password)) strengthPoints += 1;
    if (/[A-Z]/.test(password)) strengthPoints += 1;
    if (/[0-9]/.test(password)) strengthPoints += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strengthPoints += 2;
    
    let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    if (strengthPoints < 3) strength = 'weak';
    else if (strengthPoints < 5) strength = 'medium';
    else if (strengthPoints < 7) strength = 'strong';
    else strength = 'very_strong';
    
    // Override strength if password is pwned
    if (hibpResult.pwned && hibpResult.count > 1000) {
      strength = 'weak';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (hibpResult.pwned) {
      recommendations.push(`This password has appeared in ${hibpResult.count.toLocaleString()} data breaches`);
      recommendations.push('DO NOT use this password - it is known to attackers');
      recommendations.push('Choose a unique password that has never been used before');
    }
    
    if (password.length < 12) {
      recommendations.push('Use at least 12 characters for better security');
    }
    if (!/[A-Z]/.test(password)) {
      recommendations.push('Add uppercase letters for stronger password');
    }
    if (!/[0-9]/.test(password)) {
      recommendations.push('Add numbers for stronger password');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      recommendations.push('Add special characters (!@#$%^&*) for stronger password');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('This password appears to be strong and unique');
    }
    
    return {
      success: true,
      pwned: hibpResult.pwned,
      count: hibpResult.count || 0,
      strength,
      recommendations,
    };
    
  } catch (error: any) {
    logger.error(`Password check error: ${error.message}`);
    return {
      success: false,
      pwned: false,
      count: 0,
      strength: 'weak',
      recommendations: ['Unable to check password. Please try again.'],
    };
  }
}

export default { checkEmail, checkPassword };
