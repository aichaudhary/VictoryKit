/**
 * URL Scanner Service
 * Comprehensive URL threat detection using multiple sources
 */

import { virusTotal, googleSafeBrowsing, urlscan } from './externalAPIs.js';
import { logger } from '../utils/logger.js';
import ThreatIntel from '../models/ThreatIntel.js';
import ScanResult from '../models/ScanResult.js';
import crypto from 'crypto';

export interface URLScanResult {
  success: boolean;
  scan_id: string;
  url: string;
  verdict: 'safe' | 'suspicious' | 'malicious';
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  threats: URLThreat[];
  details: URLDetails;
  recommendations: string[];
  sources: string[];
  scanned_at: Date;
  cached?: boolean;
}

export interface URLThreat {
  type: string;
  description: string;
  confidence: number;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface URLDetails {
  domain: string;
  domain_age?: string;
  ssl_valid?: boolean;
  ip_address?: string;
  country?: string;
  server?: string;
  suspicious_patterns: string[];
  blacklisted_by: string[];
  categories: string[];
  redirects?: string[];
  final_url?: string;
}

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

// Extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// Generate scan ID
function generateScanId(): string {
  return `scan_${crypto.randomBytes(8).toString('hex')}`;
}

// Calculate risk score from multiple sources
function calculateRiskScore(
  vtStats: any,
  safeBrowsingThreats: any[],
  urlscanVerdict: any
): { score: number; level: 'low' | 'medium' | 'high' | 'critical' } {
  let score = 0;
  
  // VirusTotal contribution (0-50 points)
  if (vtStats) {
    const malicious = vtStats.malicious || 0;
    const suspicious = vtStats.suspicious || 0;
    const total = (vtStats.malicious || 0) + (vtStats.harmless || 0) + (vtStats.suspicious || 0) + (vtStats.undetected || 0);
    if (total > 0) {
      score += Math.min(50, ((malicious * 3 + suspicious) / total) * 100);
    }
  }
  
  // Google Safe Browsing contribution (0-30 points)
  if (safeBrowsingThreats && safeBrowsingThreats.length > 0) {
    score += Math.min(30, safeBrowsingThreats.length * 15);
  }
  
  // URLScan.io contribution (0-20 points)
  if (urlscanVerdict) {
    if (urlscanVerdict.malicious) score += 20;
    else if (urlscanVerdict.score && urlscanVerdict.score > 0) {
      score += Math.min(20, urlscanVerdict.score * 2);
    }
  }
  
  // Determine risk level
  let level: 'low' | 'medium' | 'high' | 'critical';
  if (score < 25) level = 'low';
  else if (score < 50) level = 'medium';
  else if (score < 75) level = 'high';
  else level = 'critical';
  
  return { score: Math.round(score), level };
}

// Determine verdict
function determineVerdict(riskScore: number): 'safe' | 'suspicious' | 'malicious' {
  if (riskScore < 25) return 'safe';
  if (riskScore < 60) return 'suspicious';
  return 'malicious';
}

// Generate recommendations based on threats
function generateRecommendations(
  verdict: 'safe' | 'suspicious' | 'malicious',
  threats: URLThreat[]
): string[] {
  const recommendations: string[] = [];
  
  if (verdict === 'malicious') {
    recommendations.push('DO NOT VISIT this URL - it has been flagged as dangerous');
    recommendations.push('If you already visited, scan your device for malware');
    recommendations.push('Change any passwords you may have entered on this site');
  } else if (verdict === 'suspicious') {
    recommendations.push('Exercise caution when visiting this URL');
    recommendations.push('Do not enter personal information or credentials');
    recommendations.push('Verify the legitimacy of this website before proceeding');
  } else {
    recommendations.push('No immediate threats detected');
    recommendations.push('Always verify you are on the correct website');
    recommendations.push('Use a password manager to avoid phishing attempts');
  }
  
  // Threat-specific recommendations
  const threatTypes = threats.map(t => t.type.toLowerCase());
  if (threatTypes.includes('phishing')) {
    recommendations.push('This site may attempt to steal your login credentials');
  }
  if (threatTypes.includes('malware')) {
    recommendations.push('This site may attempt to install malware on your device');
  }
  
  return recommendations;
}

/**
 * Main URL scanning function
 */
export async function scanURL(url: string, clientIP: string): Promise<URLScanResult> {
  const scan_id = generateScanId();
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  const domain = extractDomain(normalizedUrl);
  const sources: string[] = [];
  const threats: URLThreat[] = [];
  const blacklistedBy: string[] = [];
  const categories: string[] = [];
  
  logger.info(`Starting URL scan: ${normalizedUrl} (${scan_id})`);
  
  try {
    // Check cache first (1 hour TTL)
    const cachedResult = await ThreatIntel.findOne({
      indicator: normalizedUrl,
      indicator_type: 'url',
      last_updated: { $gte: new Date(Date.now() - 3600000) }, // 1 hour
    });
    
    if (cachedResult) {
      logger.info(`Cache hit for URL: ${normalizedUrl}`);
      return {
        success: true,
        scan_id,
        url: normalizedUrl,
        verdict: cachedResult.threat_data.is_malicious ? 'malicious' : 'safe',
        risk_score: cachedResult.threat_data.confidence,
        risk_level: cachedResult.threat_data.confidence > 75 ? 'critical' : 
                    cachedResult.threat_data.confidence > 50 ? 'high' :
                    cachedResult.threat_data.confidence > 25 ? 'medium' : 'low',
        threats: cachedResult.threat_data.sources?.map((s: any) => ({
          type: s.category || 'unknown',
          description: s.description || 'Cached threat data',
          confidence: s.confidence || 50,
          source: s.source || 'cache',
          severity: s.severity || 'medium',
        })) || [],
        details: {
          domain,
          suspicious_patterns: [],
          blacklisted_by: cachedResult.threat_data.categories || [],
          categories: [],
        },
        recommendations: generateRecommendations(
          cachedResult.threat_data.is_malicious ? 'malicious' : 'safe',
          []
        ),
        sources: ['cache'],
        scanned_at: new Date(),
        cached: true,
      };
    }
    
    // Run all scans in parallel
    const [vtResult, gsbResult, urlscanResult] = await Promise.allSettled([
      virusTotal.scanURL(normalizedUrl),
      googleSafeBrowsing.checkURLs([normalizedUrl]),
      urlscan.search(`domain:${domain}`),
    ]);
    
    // Process VirusTotal results
    let vtStats = null;
    if (vtResult.status === 'fulfilled' && vtResult.value.success) {
      sources.push('VirusTotal');
      vtStats = vtResult.value.stats;
      
      if (vtResult.value.results) {
        const vtResultsData = vtResult.value.results;
        for (const [engine, result] of Object.entries(vtResultsData)) {
          const r = result as any;
          if (r.category === 'malicious' || r.category === 'suspicious') {
            threats.push({
              type: r.result || 'malicious',
              description: `Detected by ${engine}`,
              confidence: r.category === 'malicious' ? 90 : 60,
              source: 'VirusTotal',
              severity: r.category === 'malicious' ? 'high' : 'medium',
            });
            if (r.category === 'malicious') {
              blacklistedBy.push(engine);
            }
          }
        }
      }
    }
    
    // Process Google Safe Browsing results
    let safeBrowsingThreats: any[] = [];
    if (gsbResult.status === 'fulfilled' && gsbResult.value.success) {
      sources.push('Google Safe Browsing');
      safeBrowsingThreats = gsbResult.value.threats || [];
      
      for (const threat of safeBrowsingThreats) {
        threats.push({
          type: threat.threatType,
          description: `Google Safe Browsing: ${threat.threatType}`,
          confidence: 95,
          source: 'Google Safe Browsing',
          severity: 'critical',
        });
        blacklistedBy.push('Google Safe Browsing');
        categories.push(threat.threatType);
      }
    }
    
    // Process URLScan.io results
    let urlscanVerdict = null;
    if (urlscanResult.status === 'fulfilled' && urlscanResult.value.success) {
      sources.push('URLScan.io');
      const results = urlscanResult.value.results;
      
      if (results && results.length > 0) {
        const latestScan = results[0];
        if (latestScan.verdicts) {
          urlscanVerdict = latestScan.verdicts.overall;
          
          if (latestScan.verdicts.overall?.malicious) {
            threats.push({
              type: 'malicious',
              description: 'URLScan.io detected malicious behavior',
              confidence: 85,
              source: 'URLScan.io',
              severity: 'high',
            });
            blacklistedBy.push('URLScan.io');
          }
          
          if (latestScan.verdicts.overall?.categories) {
            categories.push(...latestScan.verdicts.overall.categories);
          }
        }
      }
    }
    
    // Calculate final risk assessment
    const { score: riskScore, level: riskLevel } = calculateRiskScore(
      vtStats,
      safeBrowsingThreats,
      urlscanVerdict
    );
    
    const verdict = determineVerdict(riskScore);
    const recommendations = generateRecommendations(verdict, threats);
    
    // Build details object
    const details: URLDetails = {
      domain,
      suspicious_patterns: [],
      blacklisted_by: [...new Set(blacklistedBy)],
      categories: [...new Set(categories)],
    };
    
    // Detect suspicious patterns in URL
    if (normalizedUrl.includes('login') || normalizedUrl.includes('signin')) {
      details.suspicious_patterns.push('login-form');
    }
    if (normalizedUrl.includes('verify') || normalizedUrl.includes('confirm')) {
      details.suspicious_patterns.push('verification-request');
    }
    if (normalizedUrl.includes('paypal') || normalizedUrl.includes('bank')) {
      if (!domain.includes('paypal.com') && !domain.endsWith('.bank')) {
        details.suspicious_patterns.push('brand-impersonation');
      }
    }
    if (normalizedUrl.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
      details.suspicious_patterns.push('ip-address-url');
    }
    if (normalizedUrl.includes('%') || normalizedUrl.includes('..')) {
      details.suspicious_patterns.push('encoded-characters');
    }
    
    // Create result object
    const result: URLScanResult = {
      success: true,
      scan_id,
      url: normalizedUrl,
      verdict,
      risk_score: riskScore,
      risk_level: riskLevel,
      threats,
      details,
      recommendations,
      sources,
      scanned_at: new Date(),
    };
    
    // Save to cache
    await ThreatIntel.findOneAndUpdate(
      { indicator: normalizedUrl, indicator_type: 'url' },
      {
        indicator: normalizedUrl,
        indicator_type: 'url',
        threat_data: {
          is_malicious: verdict === 'malicious',
          categories: blacklistedBy,
          confidence: riskScore,
          sources: threats.map(t => ({
            source: t.source,
            category: t.type,
            description: t.description,
            confidence: t.confidence,
            severity: t.severity,
          })),
        },
        first_seen: new Date(),
        last_updated: new Date(),
        ttl: 3600,
      },
      { upsert: true, new: true }
    );
    
    // Save scan result
    await ScanResult.create({
      scan_id,
      scan_type: 'url',
      input: normalizedUrl,
      result: {
        verdict,
        risk_score: riskScore,
        risk_level: riskLevel,
        threats,
        details,
        recommendations,
      },
      sources,
      client_ip: clientIP,
      expires_at: new Date(Date.now() + 86400000), // 24 hours
    });
    
    logger.info(`URL scan complete: ${normalizedUrl} - ${verdict} (score: ${riskScore})`);
    return result;
    
  } catch (error: any) {
    logger.error(`URL scan error: ${error.message}`);
    return {
      success: false,
      scan_id,
      url: normalizedUrl,
      verdict: 'suspicious',
      risk_score: 0,
      risk_level: 'low',
      threats: [],
      details: {
        domain,
        suspicious_patterns: [],
        blacklisted_by: [],
        categories: [],
      },
      recommendations: ['Unable to complete scan. Proceed with caution.'],
      sources: [],
      scanned_at: new Date(),
    };
  }
}

export default { scanURL };
