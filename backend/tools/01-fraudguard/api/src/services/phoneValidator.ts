/**
 * Phone Validator Service
 * Validate phone numbers and check for spam/fraud
 */

import { numVerify, ipQualityScore } from './externalAPIs.js';
import { logger } from '../utils/logger.js';
import ScanResult from '../models/ScanResult.js';
import crypto from 'crypto';

export interface PhoneValidationResult {
  success: boolean;
  scan_id: string;
  phone: string;
  valid: boolean;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  details: PhoneDetails;
  spam_info: SpamInfo;
  recommendations: string[];
  sources: string[];
  scanned_at: Date;
}

export interface PhoneDetails {
  formatted: string;
  local_format: string;
  international_format: string;
  country_code: string;
  country_name: string;
  location?: string;
  carrier?: string;
  line_type: 'mobile' | 'landline' | 'voip' | 'toll_free' | 'premium' | 'unknown';
  timezone?: string;
}

export interface SpamInfo {
  is_spam: boolean;
  spam_score: number;
  spam_likelihood: string;
  is_voip: boolean;
  is_prepaid: boolean;
  is_disposable: boolean;
  recent_abuse: boolean;
  is_risky: boolean;
}

// Generate scan ID
function generateScanId(): string {
  return `scan_${crypto.randomBytes(8).toString('hex')}`;
}

// Normalize phone number
function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, '');
  // Ensure + prefix if starts with country code
  if (!normalized.startsWith('+') && normalized.length > 10) {
    normalized = '+' + normalized;
  }
  return normalized;
}

// Calculate risk level
function calculateRiskLevel(
  valid: boolean,
  spamInfo: SpamInfo
): { score: number; level: 'low' | 'medium' | 'high' | 'critical' } {
  let score = 0;
  
  if (!valid) score += 50;
  if (spamInfo.is_spam) score += 40;
  if (spamInfo.spam_score > 50) score += 30;
  if (spamInfo.is_voip) score += 15;
  if (spamInfo.is_prepaid) score += 10;
  if (spamInfo.is_disposable) score += 25;
  if (spamInfo.recent_abuse) score += 30;
  if (spamInfo.is_risky) score += 20;
  
  score = Math.min(100, score);
  
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score < 25) level = 'low';
  else if (score < 50) level = 'medium';
  else if (score < 75) level = 'high';
  else level = 'critical';
  
  return { score, level };
}

// Generate recommendations
function generateRecommendations(
  valid: boolean,
  spamInfo: SpamInfo,
  details: PhoneDetails
): string[] {
  const recommendations: string[] = [];
  
  if (!valid) {
    recommendations.push('This phone number does not appear to be valid');
    recommendations.push('Verify the phone number format and try again');
    return recommendations;
  }
  
  if (spamInfo.is_spam || spamInfo.spam_score > 70) {
    recommendations.push('This number has been reported as spam');
    recommendations.push('Do not answer calls from this number');
    recommendations.push('Block this number on your device');
  }
  
  if (spamInfo.is_voip) {
    recommendations.push('This is a VoIP (internet-based) number');
    recommendations.push('VoIP numbers can be easily spoofed - verify caller identity');
  }
  
  if (spamInfo.is_disposable) {
    recommendations.push('This appears to be a disposable/temporary number');
    recommendations.push('Exercise caution - may be used for fraud');
  }
  
  if (spamInfo.is_prepaid) {
    recommendations.push('This is a prepaid phone number');
  }
  
  if (spamInfo.recent_abuse) {
    recommendations.push('This number has been associated with recent abuse');
    recommendations.push('Be extremely cautious with any communication');
  }
  
  if (spamInfo.is_risky) {
    recommendations.push('This number has been flagged as potentially risky');
  }
  
  if (details.line_type === 'premium' || details.line_type === 'toll_free') {
    recommendations.push(`This is a ${details.line_type.replace('_', ' ')} number`);
    if (details.line_type === 'premium') {
      recommendations.push('Calling this number may incur charges');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('No immediate risks detected for this phone number');
    recommendations.push('Always verify caller identity before sharing personal information');
  }
  
  return recommendations;
}

/**
 * Main phone validation function
 */
export async function validatePhone(phone: string, clientIP: string): Promise<PhoneValidationResult> {
  const scan_id = generateScanId();
  const normalizedPhone = normalizePhone(phone);
  const sources: string[] = [];
  
  logger.info(`Starting phone validation: ${normalizedPhone} (${scan_id})`);
  
  // Basic validation
  if (normalizedPhone.replace(/\D/g, '').length < 7) {
    return {
      success: false,
      scan_id,
      phone: normalizedPhone,
      valid: false,
      risk_level: 'low',
      risk_score: 0,
      details: {
        formatted: normalizedPhone,
        local_format: normalizedPhone,
        international_format: normalizedPhone,
        country_code: '',
        country_name: 'Unknown',
        line_type: 'unknown',
      },
      spam_info: {
        is_spam: false,
        spam_score: 0,
        spam_likelihood: 'unknown',
        is_voip: false,
        is_prepaid: false,
        is_disposable: false,
        recent_abuse: false,
        is_risky: false,
      },
      recommendations: ['Phone number is too short to be valid'],
      sources: [],
      scanned_at: new Date(),
    };
  }
  
  try {
    // Run validations in parallel
    const [numverifyResult, ipqsResult] = await Promise.allSettled([
      numVerify.validate(normalizedPhone),
      ipQualityScore.checkPhone(normalizedPhone),
    ]);
    
    // Initialize defaults
    let details: PhoneDetails = {
      formatted: normalizedPhone,
      local_format: normalizedPhone,
      international_format: normalizedPhone,
      country_code: '',
      country_name: 'Unknown',
      line_type: 'unknown',
    };
    
    let spamInfo: SpamInfo = {
      is_spam: false,
      spam_score: 0,
      spam_likelihood: 'unknown',
      is_voip: false,
      is_prepaid: false,
      is_disposable: false,
      recent_abuse: false,
      is_risky: false,
    };
    
    let isValid = false;
    
    // Process NumVerify results
    if (numverifyResult.status === 'fulfilled' && numverifyResult.value.success) {
      sources.push('NumVerify');
      const nv = numverifyResult.value;
      isValid = nv.valid;
      details = {
        formatted: nv.number || normalizedPhone,
        local_format: nv.localFormat || normalizedPhone,
        international_format: nv.internationalFormat || normalizedPhone,
        country_code: nv.countryCode || '',
        country_name: nv.countryName || 'Unknown',
        location: nv.location,
        carrier: nv.carrier,
        line_type: (nv.lineType || 'unknown') as PhoneDetails['line_type'],
      };
    }
    
    // Process IPQualityScore results
    if (ipqsResult.status === 'fulfilled' && ipqsResult.value.success) {
      sources.push('IPQualityScore');
      const ipqs = ipqsResult.value;
      
      // Override validity if IPQS says valid
      if (ipqs.valid !== undefined) {
        isValid = isValid || ipqs.valid;
      }
      
      // Update details with IPQS data
      if (ipqs.formatted) details.formatted = ipqs.formatted;
      if (ipqs.localFormat) details.local_format = ipqs.localFormat;
      if (ipqs.carrier) details.carrier = ipqs.carrier;
      if (ipqs.country) details.country_name = ipqs.country;
      if (ipqs.city) details.location = ipqs.city;
      if (ipqs.timezone) details.timezone = ipqs.timezone;
      if (ipqs.lineType) {
        details.line_type = ipqs.lineType.toLowerCase() as PhoneDetails['line_type'];
      }
      
      // Spam info from IPQS
      spamInfo = {
        is_spam: ipqs.fraudScore > 75 || ipqs.spamNumberLikelihood === 'high',
        spam_score: ipqs.fraudScore || 0,
        spam_likelihood: ipqs.spamNumberLikelihood || 'unknown',
        is_voip: ipqs.voip || false,
        is_prepaid: ipqs.prepaid || false,
        is_disposable: false, // Not directly available
        recent_abuse: ipqs.recentAbuse || false,
        is_risky: ipqs.risky || false,
      };
    }
    
    // Calculate risk
    const { score: riskScore, level: riskLevel } = calculateRiskLevel(isValid, spamInfo);
    
    // Generate recommendations
    const recommendations = generateRecommendations(isValid, spamInfo, details);
    
    // Create result
    const result: PhoneValidationResult = {
      success: true,
      scan_id,
      phone: normalizedPhone,
      valid: isValid,
      risk_level: riskLevel,
      risk_score: riskScore,
      details,
      spam_info: spamInfo,
      recommendations,
      sources,
      scanned_at: new Date(),
    };
    
    // Save scan result
    await ScanResult.create({
      scan_id,
      scan_type: 'phone',
      input: normalizedPhone,
      result: {
        verdict: riskLevel === 'critical' || riskLevel === 'high' ? 'malicious' :
                 riskLevel === 'medium' ? 'suspicious' : 'safe',
        risk_score: riskScore,
        risk_level: riskLevel,
        threats: spamInfo.is_spam ? [{
          type: 'spam',
          description: 'Phone number flagged as spam',
          confidence: spamInfo.spam_score,
          source: 'IPQualityScore',
          severity: riskLevel,
        }] : [],
        details: { ...details, spam_info: spamInfo },
        recommendations,
      },
      sources,
      client_ip: clientIP,
      expires_at: new Date(Date.now() + 86400000), // 24 hours
    });
    
    logger.info(`Phone validation complete: ${normalizedPhone} - valid: ${isValid}, risk: ${riskLevel}`);
    return result;
    
  } catch (error: any) {
    logger.error(`Phone validation error: ${error.message}`);
    return {
      success: false,
      scan_id,
      phone: normalizedPhone,
      valid: false,
      risk_level: 'low',
      risk_score: 0,
      details: {
        formatted: normalizedPhone,
        local_format: normalizedPhone,
        international_format: normalizedPhone,
        country_code: '',
        country_name: 'Unknown',
        line_type: 'unknown',
      },
      spam_info: {
        is_spam: false,
        spam_score: 0,
        spam_likelihood: 'unknown',
        is_voip: false,
        is_prepaid: false,
        is_disposable: false,
        recent_abuse: false,
        is_risky: false,
      },
      recommendations: ['Unable to validate phone number. Please try again.'],
      sources: [],
      scanned_at: new Date(),
    };
  }
}

export default { validatePhone };
