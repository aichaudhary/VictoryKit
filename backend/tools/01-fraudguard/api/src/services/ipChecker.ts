/**
 * IP Checker Service
 * Check IP address reputation and threat intelligence
 */

import { abuseIPDB, ipQualityScore } from './externalAPIs.js';
import { logger } from '../utils/logger.js';
import ScanResult from '../models/ScanResult.js';
import ThreatIntel from '../models/ThreatIntel.js';
import crypto from 'crypto';

export interface IPCheckResult {
  success: boolean;
  scan_id: string;
  ip: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  is_malicious: boolean;
  geolocation: IPGeolocation;
  network_info: NetworkInfo;
  threat_info: ThreatInfo;
  abuse_reports: AbuseReport[];
  recommendations: string[];
  sources: string[];
  scanned_at: Date;
  cached?: boolean;
}

export interface IPGeolocation {
  country_code: string;
  country_name: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface NetworkInfo {
  isp: string;
  organization?: string;
  asn?: string;
  domain?: string;
  hostnames: string[];
  connection_type?: string;
  is_datacenter: boolean;
}

export interface ThreatInfo {
  is_proxy: boolean;
  is_vpn: boolean;
  is_tor: boolean;
  is_bot: boolean;
  is_crawler: boolean;
  abuse_confidence: number;
  recent_abuse: boolean;
  fraud_score: number;
  abuse_velocity?: string;
}

export interface AbuseReport {
  date: string;
  comment: string;
  categories: string[];
  reporter_country?: string;
}

// IP validation regex
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}:)*:[0-9a-fA-F]{1,4}$/;

// Generate scan ID
function generateScanId(): string {
  return `scan_${crypto.randomBytes(8).toString('hex')}`;
}

// Validate IP format
function isValidIP(ip: string): boolean {
  return IPV4_REGEX.test(ip) || IPV6_REGEX.test(ip);
}

// Check if IP is private/reserved
function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 127.0.0.0/8 (loopback)
  if (parts[0] === 127) return true;
  // 169.254.0.0/16 (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;
  
  return false;
}

// Calculate risk level
function calculateRiskLevel(
  threatInfo: ThreatInfo
): { score: number; level: 'low' | 'medium' | 'high' | 'critical' } {
  let score = 0;
  
  // Abuse confidence (0-100)
  score += threatInfo.abuse_confidence * 0.4;
  
  // Fraud score (0-100)
  score += threatInfo.fraud_score * 0.3;
  
  // Risk factors
  if (threatInfo.is_tor) score += 20;
  if (threatInfo.is_proxy) score += 15;
  if (threatInfo.is_vpn) score += 10;
  if (threatInfo.is_bot) score += 25;
  if (threatInfo.recent_abuse) score += 20;
  
  score = Math.min(100, score);
  
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score < 25) level = 'low';
  else if (score < 50) level = 'medium';
  else if (score < 75) level = 'high';
  else level = 'critical';
  
  return { score: Math.round(score), level };
}

// Abuse category mapping
const ABUSE_CATEGORIES: Record<number, string> = {
  1: 'DNS Compromise',
  2: 'DNS Poisoning',
  3: 'Fraud Orders',
  4: 'DDoS Attack',
  5: 'FTP Brute-Force',
  6: 'Ping of Death',
  7: 'Phishing',
  8: 'Fraud VoIP',
  9: 'Open Proxy',
  10: 'Web Spam',
  11: 'Email Spam',
  12: 'Blog Spam',
  13: 'VPN IP',
  14: 'Port Scan',
  15: 'Hacking',
  16: 'SQL Injection',
  17: 'Spoofing',
  18: 'Brute-Force',
  19: 'Bad Web Bot',
  20: 'Exploited Host',
  21: 'Web App Attack',
  22: 'SSH',
  23: 'IoT Targeted',
};

// Generate recommendations
function generateRecommendations(
  threatInfo: ThreatInfo,
  abuseReports: AbuseReport[],
  networkInfo: NetworkInfo
): string[] {
  const recommendations: string[] = [];
  
  if (threatInfo.abuse_confidence > 75) {
    recommendations.push('This IP has a high abuse confidence score');
    recommendations.push('Block traffic from this IP address');
  }
  
  if (threatInfo.is_tor) {
    recommendations.push('This IP is a Tor exit node - may be used for anonymous activity');
  }
  
  if (threatInfo.is_proxy) {
    recommendations.push('This IP is detected as a proxy server');
    recommendations.push('Real client IP may be hidden behind this proxy');
  }
  
  if (threatInfo.is_vpn) {
    recommendations.push('This IP belongs to a VPN service');
    recommendations.push('User location and identity may be masked');
  }
  
  if (threatInfo.is_bot) {
    recommendations.push('This IP shows bot-like behavior');
    recommendations.push('Consider implementing CAPTCHA or rate limiting');
  }
  
  if (networkInfo.is_datacenter) {
    recommendations.push('This IP originates from a datacenter');
    recommendations.push('May be used for automated/non-human traffic');
  }
  
  if (abuseReports.length > 0) {
    recommendations.push(`This IP has ${abuseReports.length} abuse report(s)`);
    
    // Get unique abuse categories
    const categories = new Set<string>();
    abuseReports.forEach(r => r.categories.forEach(c => categories.add(c)));
    if (categories.size > 0) {
      recommendations.push(`Reported for: ${Array.from(categories).join(', ')}`);
    }
  }
  
  if (threatInfo.recent_abuse) {
    recommendations.push('This IP was involved in recent abuse activity');
    recommendations.push('Exercise extreme caution with traffic from this IP');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('No significant threats detected for this IP');
    recommendations.push('Continue monitoring for suspicious activity');
  }
  
  return recommendations;
}

/**
 * Main IP check function
 */
export async function checkIP(ip: string, clientIP: string): Promise<IPCheckResult> {
  const scan_id = generateScanId();
  const sources: string[] = [];
  
  logger.info(`Starting IP check: ${ip} (${scan_id})`);
  
  // Validate IP format
  if (!isValidIP(ip)) {
    return {
      success: false,
      scan_id,
      ip,
      risk_level: 'low',
      risk_score: 0,
      is_malicious: false,
      geolocation: {
        country_code: '',
        country_name: 'Unknown',
      },
      network_info: {
        isp: 'Unknown',
        hostnames: [],
        is_datacenter: false,
      },
      threat_info: {
        is_proxy: false,
        is_vpn: false,
        is_tor: false,
        is_bot: false,
        is_crawler: false,
        abuse_confidence: 0,
        recent_abuse: false,
        fraud_score: 0,
      },
      abuse_reports: [],
      recommendations: ['Invalid IP address format'],
      sources: [],
      scanned_at: new Date(),
    };
  }
  
  // Check for private/reserved IPs
  if (isPrivateIP(ip)) {
    return {
      success: true,
      scan_id,
      ip,
      risk_level: 'low',
      risk_score: 0,
      is_malicious: false,
      geolocation: {
        country_code: 'XX',
        country_name: 'Private Network',
      },
      network_info: {
        isp: 'Private/Reserved',
        hostnames: [],
        is_datacenter: false,
      },
      threat_info: {
        is_proxy: false,
        is_vpn: false,
        is_tor: false,
        is_bot: false,
        is_crawler: false,
        abuse_confidence: 0,
        recent_abuse: false,
        fraud_score: 0,
      },
      abuse_reports: [],
      recommendations: ['This is a private/reserved IP address - not routable on the internet'],
      sources: [],
      scanned_at: new Date(),
    };
  }
  
  try {
    // Check cache first (30 minutes TTL)
    const cachedResult = await ThreatIntel.findOne({
      indicator: ip,
      indicator_type: 'ip',
      last_updated: { $gte: new Date(Date.now() - 1800000) }, // 30 min
    });
    
    if (cachedResult) {
      logger.info(`Cache hit for IP: ${ip}`);
      const threat = cachedResult.threat_data;
      return {
        success: true,
        scan_id,
        ip,
        risk_level: threat.confidence > 75 ? 'critical' :
                    threat.confidence > 50 ? 'high' :
                    threat.confidence > 25 ? 'medium' : 'low',
        risk_score: threat.confidence,
        is_malicious: threat.is_malicious,
        geolocation: threat.geolocation || { country_code: '', country_name: 'Unknown' },
        network_info: threat.network_info || { isp: 'Unknown', hostnames: [], is_datacenter: false },
        threat_info: threat.threat_info || {
          is_proxy: false, is_vpn: false, is_tor: false, is_bot: false,
          is_crawler: false, abuse_confidence: 0, recent_abuse: false, fraud_score: 0,
        },
        abuse_reports: threat.abuse_reports || [],
        recommendations: generateRecommendations(
          threat.threat_info || {},
          threat.abuse_reports || [],
          threat.network_info || {}
        ),
        sources: ['cache'],
        scanned_at: new Date(),
        cached: true,
      };
    }
    
    // Run checks in parallel
    const [abuseipdbResult, ipqsResult] = await Promise.allSettled([
      abuseIPDB.check(ip, 90),
      ipQualityScore.checkIP(ip),
    ]);
    
    // Initialize defaults
    let geolocation: IPGeolocation = {
      country_code: '',
      country_name: 'Unknown',
    };
    
    let networkInfo: NetworkInfo = {
      isp: 'Unknown',
      hostnames: [],
      is_datacenter: false,
    };
    
    let threatInfo: ThreatInfo = {
      is_proxy: false,
      is_vpn: false,
      is_tor: false,
      is_bot: false,
      is_crawler: false,
      abuse_confidence: 0,
      recent_abuse: false,
      fraud_score: 0,
    };
    
    let abuseReports: AbuseReport[] = [];
    
    // Process AbuseIPDB results
    if (abuseipdbResult.status === 'fulfilled' && abuseipdbResult.value.success) {
      sources.push('AbuseIPDB');
      const abuse = abuseipdbResult.value;
      
      geolocation = {
        country_code: abuse.countryCode || '',
        country_name: abuse.countryName || 'Unknown',
      };
      
      networkInfo = {
        isp: abuse.isp || 'Unknown',
        domain: abuse.domain,
        hostnames: abuse.hostnames || [],
        is_datacenter: (abuse.usageType || '').toLowerCase().includes('data center'),
      };
      
      threatInfo.abuse_confidence = abuse.abuseConfidenceScore || 0;
      threatInfo.is_tor = abuse.isTor || false;
      
      // Process abuse reports
      if (abuse.reports && abuse.reports.length > 0) {
        abuseReports = abuse.reports.slice(0, 10).map((r: any) => ({
          date: r.reportedAt,
          comment: r.comment || '',
          categories: (r.categories || []).map((c: number) => ABUSE_CATEGORIES[c] || `Category ${c}`),
          reporter_country: r.reporterCountryCode,
        }));
      }
    }
    
    // Process IPQualityScore results
    if (ipqsResult.status === 'fulfilled' && ipqsResult.value.success) {
      sources.push('IPQualityScore');
      const ipqs = ipqsResult.value;
      
      // Update geolocation
      if (ipqs.country) geolocation.country_code = ipqs.country;
      if (ipqs.city) geolocation.city = ipqs.city;
      
      // Update network info
      if (ipqs.isp) networkInfo.isp = ipqs.isp;
      if (ipqs.organization) networkInfo.organization = ipqs.organization;
      if (ipqs.asn) networkInfo.asn = `AS${ipqs.asn}`;
      if (ipqs.host) networkInfo.hostnames = [ipqs.host, ...networkInfo.hostnames];
      if (ipqs.connectionType) networkInfo.connection_type = ipqs.connectionType;
      
      // Update threat info
      threatInfo.is_proxy = ipqs.isProxy || false;
      threatInfo.is_vpn = ipqs.isVPN || false;
      threatInfo.is_tor = threatInfo.is_tor || ipqs.isTor || false;
      threatInfo.is_bot = ipqs.isBot || false;
      threatInfo.is_crawler = ipqs.isCrawler || false;
      threatInfo.fraud_score = ipqs.fraudScore || 0;
      threatInfo.recent_abuse = ipqs.recentAbuse || false;
      threatInfo.abuse_velocity = ipqs.abuseVelocity;
    }
    
    // Calculate risk
    const { score: riskScore, level: riskLevel } = calculateRiskLevel(threatInfo);
    const isMalicious = riskScore >= 70;
    
    // Generate recommendations
    const recommendations = generateRecommendations(threatInfo, abuseReports, networkInfo);
    
    // Create result
    const result: IPCheckResult = {
      success: true,
      scan_id,
      ip,
      risk_level: riskLevel,
      risk_score: riskScore,
      is_malicious: isMalicious,
      geolocation,
      network_info: networkInfo,
      threat_info: threatInfo,
      abuse_reports: abuseReports,
      recommendations,
      sources,
      scanned_at: new Date(),
    };
    
    // Save to cache
    await ThreatIntel.findOneAndUpdate(
      { indicator: ip, indicator_type: 'ip' },
      {
        indicator: ip,
        indicator_type: 'ip',
        threat_data: {
          is_malicious: isMalicious,
          categories: abuseReports.flatMap(r => r.categories),
          confidence: riskScore,
          geolocation,
          network_info: networkInfo,
          threat_info: threatInfo,
          abuse_reports: abuseReports,
        },
        first_seen: new Date(),
        last_updated: new Date(),
        ttl: 1800, // 30 minutes
      },
      { upsert: true, new: true }
    );
    
    // Save scan result
    await ScanResult.create({
      scan_id,
      scan_type: 'ip',
      input: ip,
      result: {
        verdict: isMalicious ? 'malicious' : riskLevel === 'medium' ? 'suspicious' : 'safe',
        risk_score: riskScore,
        risk_level: riskLevel,
        threats: isMalicious ? [{
          type: 'malicious_ip',
          description: `IP flagged with ${riskScore}% confidence`,
          confidence: riskScore,
          source: sources.join(', '),
          severity: riskLevel,
        }] : [],
        details: { geolocation, network_info: networkInfo, threat_info: threatInfo },
        recommendations,
      },
      sources,
      client_ip: clientIP,
      expires_at: new Date(Date.now() + 86400000), // 24 hours
    });
    
    logger.info(`IP check complete: ${ip} - risk: ${riskLevel} (${riskScore})`);
    return result;
    
  } catch (error: any) {
    logger.error(`IP check error: ${error.message}`);
    return {
      success: false,
      scan_id,
      ip,
      risk_level: 'low',
      risk_score: 0,
      is_malicious: false,
      geolocation: { country_code: '', country_name: 'Unknown' },
      network_info: { isp: 'Unknown', hostnames: [], is_datacenter: false },
      threat_info: {
        is_proxy: false, is_vpn: false, is_tor: false, is_bot: false,
        is_crawler: false, abuse_confidence: 0, recent_abuse: false, fraud_score: 0,
      },
      abuse_reports: [],
      recommendations: ['Unable to check IP. Please try again.'],
      sources: [],
      scanned_at: new Date(),
    };
  }
}

export default { checkIP };
