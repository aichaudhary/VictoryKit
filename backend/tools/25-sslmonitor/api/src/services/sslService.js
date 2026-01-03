/**
 * SSL Service - Advanced Certificate Scanning and Analysis
 */

const tls = require('tls');
const https = require('https');
const crypto = require('crypto');
const dns = require('dns').promises;
const axios = require('axios');
const Certificate = require('../models/Certificate');
const Alert = require('../models/Alert');
const { getConnectors } = require('../../../../../shared/connectors');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8025';

// External API configurations
const SSL_LABS_API = {
    baseUrl: process.env.SSL_LABS_API_URL || 'https://api.ssllabs.com/api/v3',
    apiKey: process.env.SSL_LABS_API_KEY,
    maxAssessments: parseInt(process.env.SSL_LABS_MAX_ASSESSMENTS) || 500
};

const CRT_SH_API = {
    baseUrl: process.env.CRT_SH_API_URL || 'https://crt.sh'
};

const VIRUSTOTAL_API = {
    baseUrl: process.env.VIRUSTOTAL_API_URL || 'https://www.virustotal.com/api/v3',
    apiKey: process.env.VIRUSTOTAL_API_KEY
};

const SHODAN_API = {
    baseUrl: process.env.SHODAN_API_URL || 'https://api.shodan.io',
    apiKey: process.env.SHODAN_API_KEY
};

const CENSYS_API = {
    baseUrl: process.env.CENSYS_API_URL || 'https://search.censys.io/api/v2',
    apiId: process.env.CENSYS_API_ID,
    apiSecret: process.env.CENSYS_API_SECRET
};

class SSLService {
    constructor() {
        this.scanQueue = new Map();
        this.rateLimits = new Map();
        this.cache = new Map();
        this.cacheTimeout = parseInt(process.env.CACHE_TTL) || 3600000; // 1 hour
    }

    /**
     * Comprehensive SSL certificate scan
     */
    async comprehensiveScan(domain, options = {}) {
        const startTime = Date.now();
        const scanId = `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            console.log(`🔍 Starting comprehensive scan for ${domain}, ScanID: ${scanId}`);

            // Notify WebSocket clients
            if (global.wsServer) {
                global.wsServer.notifyScanStarted(scanId, domain);
            }

            // Initialize scan result
            const scanResult = {
                scanId,
                domain,
                startTime: new Date(),
                status: 'running',
                progress: 0,
                results: {},
                errors: []
            };

            this.scanQueue.set(scanId, scanResult);

            // Step 1: Basic TLS connection scan (15% progress)
            scanResult.progress = 15;
            this.updateScanProgress(scanId, 15, 'basic_scan');
            const basicInfo = await this.performBasicScan(domain, options.port || 443);
            scanResult.results.basic = basicInfo;

            // Step 2: SSL Labs assessment (25% progress)
            scanResult.progress = 25;
            this.updateScanProgress(scanId, 25, 'ssl_labs');
            const sslLabsResult = await this.performSSLLabsAssessment(domain);
            scanResult.results.sslLabs = sslLabsResult;

            // Step 3: Certificate transparency check (35% progress)
            scanResult.progress = 35;
            this.updateScanProgress(scanId, 35, 'certificate_transparency');
            const ctResults = await this.checkCertificateTransparency(domain);
            scanResult.results.certificateTransparency = ctResults;

            // Step 4: External API scans (parallel) (60% progress)
            scanResult.progress = 60;
            this.updateScanProgress(scanId, 60, 'external_apis');
            const [censysResult, shodanResult, virusTotalResult] = await Promise.allSettled([
                this.performCensysScan(domain),
                this.performShodanScan(domain),
                this.performVirusTotalScan(domain)
            ]);
            scanResult.results.censys = censysResult.status === 'fulfilled' ? censysResult.value : { error: censysResult.reason?.message };
            scanResult.results.shodan = shodanResult.status === 'fulfilled' ? shodanResult.value : { error: shodanResult.reason?.message };
            scanResult.results.virusTotal = virusTotalResult.status === 'fulfilled' ? virusTotalResult.value : { error: virusTotalResult.reason?.message };

            // Step 5: Security analysis (80% progress)
            scanResult.progress = 80;
            this.updateScanProgress(scanId, 80, 'security_analysis');
            const securityAnalysis = await this.performSecurityAnalysis(basicInfo, sslLabsResult, scanResult.results);
            scanResult.results.security = securityAnalysis;

            // Step 6: Compliance check (90% progress)
            scanResult.progress = 90;
            this.updateScanProgress(scanId, 90, 'compliance_check');
            const complianceResults = await this.performComplianceCheck(domain, basicInfo);
            scanResult.results.compliance = complianceResults;

            // Step 7: Finalize and save (100% progress)
            scanResult.progress = 100;
            scanResult.status = 'completed';
            scanResult.endTime = new Date();
            scanResult.duration = Date.now() - startTime;

            this.updateScanProgress(scanId, 100, 'completed');

            // Save to database
            await this.saveScanResults(domain, scanResult);

            // Notify WebSocket clients
            if (global.wsServer) {
                global.wsServer.notifyScanCompleted(scanId, scanResult.results);
            }

            console.log(`✅ Comprehensive scan completed for ${domain} in ${scanResult.duration}ms`);
            return scanResult;

        } catch (error) {
            console.error(`❌ Scan failed for ${domain}:`, error);
            scanResult.status = 'failed';
            scanResult.errors.push(error.message);
            scanResult.endTime = new Date();

            this.updateScanProgress(scanId, 0, 'failed');

            throw error;
        } finally {
            // Clean up scan queue after some time
            setTimeout(() => {
                this.scanQueue.delete(scanId);
            }, 3600000); // 1 hour
        }
    }

    /**
     * Basic TLS certificate scan
     */
    async performBasicScan(hostname, port = 443) {
        return new Promise((resolve, reject) => {
            const options = {
                host: hostname,
                port: port,
                servername: hostname,
                rejectUnauthorized: false,
                timeout: parseInt(process.env.SCAN_TIMEOUT) || 30000
            };

            const socket = tls.connect(options, () => {
                try {
                    const cert = socket.getPeerCertificate(true);
                    const protocol = socket.getProtocol();
                    const cipher = socket.getCipher();

                    socket.end();

                    if (!cert || !cert.subject) {
                        resolve({
                            success: false,
                            error: 'No certificate found',
                            hostname,
                            port
                        });
                        return;
                    }

                    const certificate = this.parseCertificate(cert, hostname, port);
                    const chain = this.parseChain(cert);
                    const protocols = this.getSupportedProtocols(hostname, port);
                    const ciphers = this.getSupportedCiphers(hostname, port);

                    resolve({
                        success: true,
                        hostname,
                        port,
                        certificate,
                        chain,
                        protocol,
                        cipher,
                        protocols,
                        ciphers
                    });

                } catch (error) {
                    reject(error);
                }
            });

            socket.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    hostname,
                    port
                });
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve({
                    success: false,
                    error: 'Connection timeout',
                    hostname,
                    port
                });
            });
        });
    }

    /**
     * SSL Labs API assessment
     */
    async performSSLLabsAssessment(domain) {
        try {
            if (!SSL_LABS_API.apiKey) {
                return { available: false, reason: 'API key not configured' };
            }

            // Check rate limit
            if (this.isRateLimited('ssllabs')) {
                return { available: false, reason: 'Rate limit exceeded' };
            }

            const response = await axios.get(`${SSL_LABS_API.baseUrl}/analyze`, {
                params: {
                    host: domain,
                    publish: 'off',
                    startNew: 'on',
                    all: 'done',
                    ignoreMismatch: 'on'
                },
                headers: {
                    'X-API-Key': SSL_LABS_API.apiKey
                },
                timeout: 60000
            });

            if (response.data.status === 'READY') {
                return {
                    available: true,
                    grade: response.data.endpoints[0]?.grade || 'T',
                    score: this.gradeToScore(response.data.endpoints[0]?.grade || 'T'),
                    details: response.data
                };
            }

            // If assessment is still running, wait and retry
            if (response.data.status === 'IN_PROGRESS') {
                await new Promise(resolve => setTimeout(resolve, 5000));
                return this.performSSLLabsAssessment(domain);
            }

            return { available: false, reason: 'Assessment failed' };

        } catch (error) {
            console.error('SSL Labs assessment error:', error);
            return { available: false, reason: error.message };
        }
    }

    /**
     * Certificate Transparency monitoring
     */
    async checkCertificateTransparency(domain) {
        try {
            const response = await axios.get(`${CRT_SH_API.baseUrl}/`, {
                params: {
                    q: domain,
                    output: 'json'
                },
                timeout: 30000
            });

            const certificates = response.data || [];

            return {
                logged: certificates.length > 0,
                totalEntries: certificates.length,
                recentEntries: certificates.slice(0, 10).map(cert => ({
                    id: cert.id,
                    notBefore: cert.not_before,
                    notAfter: cert.not_after,
                    issuer: cert.issuer_name,
                    loggedAt: cert.entry_timestamp
                }))
            };

        } catch (error) {
            console.error('Certificate Transparency check error:', error);
            return { logged: false, error: error.message };
        }
    }

    /**
     * Censys certificate and host analysis
     */
    async performCensysScan(domain) {
        try {
            if (!CENSYS_API.apiId || !CENSYS_API.apiSecret) {
                return { available: false, reason: 'API credentials not configured' };
            }

            // Check rate limit
            if (this.isRateLimited('censys')) {
                return { available: false, reason: 'Rate limit exceeded' };
            }

            const auth = Buffer.from(`${CENSYS_API.apiId}:${CENSYS_API.apiSecret}`).toString('base64');

            // Search for certificates
            const certResponse = await axios.get(`${CENSYS_API.baseUrl}/certificates/search`, {
                params: {
                    q: `parsed.names: ${domain}`,
                    fields: 'parsed.names,parsed.validity,parsed.subject,parsed.issuer,parsed.signature_algorithm,parsed.extensions'
                },
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                timeout: 30000
            });

            // Search for hosts
            const hostResponse = await axios.get(`${CENSYS_API.baseUrl}/hosts/search`, {
                params: {
                    q: `services.tls.certificates.leaf_data.names: ${domain}`,
                    fields: 'services.tls.certificates.leaf_data,services.tls.cipher_suite,ip,location'
                },
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                timeout: 30000
            });

            const certificates = certResponse.data?.result?.hits || [];
            const hosts = hostResponse.data?.result?.hits || [];

            return {
                available: true,
                certificates: {
                    total: certificates.length,
                    valid: certificates.filter(cert => {
                        const validity = cert.parsed?.validity;
                        if (!validity) return false;
                        const now = new Date();
                        const notAfter = new Date(validity.not_after);
                        const notBefore = new Date(validity.not_before);
                        return now >= notBefore && now <= notAfter;
                    }).length,
                    expired: certificates.filter(cert => {
                        const validity = cert.parsed?.validity;
                        if (!validity) return false;
                        const now = new Date();
                        const notAfter = new Date(validity.not_after);
                        return now > notAfter;
                    }).length,
                    weakSignatures: certificates.filter(cert =>
                        cert.parsed?.signature_algorithm?.includes('md5') ||
                        cert.parsed?.signature_algorithm?.includes('sha1')
                    ).length
                },
                hosts: {
                    total: hosts.length,
                    locations: [...new Set(hosts.map(host => host.location?.country).filter(Boolean))],
                    cipherSuites: [...new Set(hosts.flatMap(host =>
                        host.services?.tls?.cipher_suite?.name ? [host.services.tls.cipher_suite.name] : []
                    ))]
                },
                analysis: this.analyzeCensysData(certificates, hosts)
            };

        } catch (error) {
            console.error('Censys scan error:', error);
            return { available: false, reason: error.message };
        }
    }

    /**
     * Shodan SSL and security analysis
     */
    async performShodanScan(domain) {
        try {
            if (!SHODAN_API.apiKey) {
                return { available: false, reason: 'API key not configured' };
            }

            // Check rate limit
            if (this.isRateLimited('shodan')) {
                return { available: false, reason: 'Rate limit exceeded' };
            }

            const response = await axios.get(`${SHODAN_API.baseUrl}/shodan/host/${domain}`, {
                params: { key: SHODAN_API.apiKey },
                timeout: 30000
            });

            const sslServices = response.data.data?.filter(service => service.ssl) || [];
            const vulnerabilities = response.data.data?.flatMap(service => service.vulns || []) || [];

            return {
                available: true,
                services: sslServices.map(service => ({
                    port: service.port,
                    ssl: service.ssl,
                    vulnerabilities: service.vulns || {}
                })),
                vulnerabilities: {
                    total: vulnerabilities.length,
                    critical: vulnerabilities.filter(v => v.cvss >= 9.0).length,
                    high: vulnerabilities.filter(v => v.cvss >= 7.0 && v.cvss < 9.0).length,
                    medium: vulnerabilities.filter(v => v.cvss >= 4.0 && v.cvss < 7.0).length,
                    low: vulnerabilities.filter(v => v.cvss < 4.0).length
                },
                analysis: this.analyzeShodanData(sslServices, vulnerabilities)
            };

        } catch (error) {
            console.error('Shodan scan error:', error);
            return { available: false, reason: error.message };
        }
    }

    /**
     * VirusTotal domain and certificate analysis
     */
    async performVirusTotalScan(domain) {
        try {
            if (!VIRUSTOTAL_API.apiKey) {
                return { available: false, reason: 'API key not configured' };
            }

            // Check rate limit
            if (this.isRateLimited('virustotal')) {
                return { available: false, reason: 'Rate limit exceeded' };
            }

            const response = await axios.get(`${VIRUSTOTAL_API.baseUrl}/domains/${domain}`, {
                headers: { 'x-apikey': VIRUSTOTAL_API.apiKey },
                timeout: 30000
            });

            const data = response.data.data?.attributes || {};
            const lastAnalysis = data.last_analysis_stats || {};

            return {
                available: true,
                reputation: data.reputation || 0,
                categories: data.categories || {},
                analysis: {
                    malicious: lastAnalysis.malicious || 0,
                    suspicious: lastAnalysis.suspicious || 0,
                    harmless: lastAnalysis.harmless || 0,
                    undetected: lastAnalysis.undetected || 0,
                    timeout: lastAnalysis.timeout || 0
                },
                lastAnalysisDate: data.last_analysis_date,
                whois: data.whois,
                analysis: this.analyzeVirusTotalData(data)
            };

        } catch (error) {
            console.error('VirusTotal scan error:', error);
            return { available: false, reason: error.message };
        }
    }

    /**
     * Analyze Censys scan data
     */
    analyzeCensysData(certificates, hosts) {
        const analysis = {
            issues: [],
            recommendations: []
        };

        // Certificate analysis
        if (certificates.length > 0) {
            const expired = certificates.filter(cert => {
                const validity = cert.parsed?.validity;
                if (!validity) return false;
                const now = new Date();
                const notAfter = new Date(validity.not_after);
                return now > notAfter;
            });

            if (expired.length > 0) {
                analysis.issues.push({
                    severity: 'high',
                    title: 'Expired Certificates Found',
                    description: `${expired.length} expired certificates detected in Certificate Transparency logs`,
                    remediation: 'Review and remove expired certificates'
                });
            }

            const weakSigs = certificates.filter(cert =>
                cert.parsed?.signature_algorithm?.includes('md5') ||
                cert.parsed?.signature_algorithm?.includes('sha1')
            );

            if (weakSigs.length > 0) {
                analysis.issues.push({
                    severity: 'medium',
                    title: 'Weak Signature Algorithms',
                    description: `${weakSigs.length} certificates use weak signature algorithms (MD5/SHA1)`,
                    remediation: 'Regenerate certificates with SHA-256 or stronger algorithms'
                });
            }
        }

        // Host analysis
        if (hosts.length > 0) {
            const uniqueLocations = [...new Set(hosts.map(host => host.location?.country).filter(Boolean))];
            if (uniqueLocations.length > 1) {
                analysis.recommendations.push({
                    title: 'Multi-Region Deployment',
                    description: `Certificate deployed across ${uniqueLocations.length} countries: ${uniqueLocations.join(', ')}`,
                    type: 'info'
                });
            }
        }

        return analysis;
    }

    /**
     * Analyze Shodan scan data
     */
    analyzeShodanData(sslServices, vulnerabilities) {
        const analysis = {
            issues: [],
            recommendations: []
        };

        // SSL service analysis
        sslServices.forEach(service => {
            const ssl = service.ssl;
            if (ssl) {
                // Check for expired certificates
                if (ssl.cert && ssl.cert.not_after) {
                    const expiry = new Date(ssl.cert.not_after * 1000);
                    const now = new Date();
                    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

                    if (daysUntilExpiry < 30) {
                        analysis.issues.push({
                            severity: daysUntilExpiry < 0 ? 'critical' : 'high',
                            title: `Certificate Expiring on Port ${service.port}`,
                            description: `SSL certificate expires in ${daysUntilExpiry} days`,
                            remediation: 'Renew certificate before expiry'
                        });
                    }
                }

                // Check cipher suites
                if (ssl.cipher && (ssl.cipher.name.includes('RC4') || ssl.cipher.name.includes('DES'))) {
                    analysis.issues.push({
                        severity: 'high',
                        title: `Weak Cipher Suite on Port ${service.port}`,
                        description: `Using deprecated cipher: ${ssl.cipher.name}`,
                        remediation: 'Configure server to use modern cipher suites (AES-GCM, ChaCha20-Poly1305)'
                    });
                }
            }
        });

        // Vulnerability analysis
        if (vulnerabilities.length > 0) {
            const critical = vulnerabilities.filter(v => v.cvss >= 9.0);
            const high = vulnerabilities.filter(v => v.cvss >= 7.0 && v.cvss < 9.0);

            if (critical.length > 0) {
                analysis.issues.push({
                    severity: 'critical',
                    title: 'Critical Vulnerabilities Detected',
                    description: `${critical.length} critical vulnerabilities found`,
                    remediation: 'Apply security patches immediately'
                });
            }

            if (high.length > 0) {
                analysis.issues.push({
                    severity: 'high',
                    title: 'High-Severity Vulnerabilities',
                    description: `${high.length} high-severity vulnerabilities found`,
                    remediation: 'Plan and apply security updates'
                });
            }
        }

        return analysis;
    }

    /**
     * Analyze VirusTotal scan data
     */
    analyzeVirusTotalData(data) {
        const analysis = {
            issues: [],
            recommendations: []
        };

        const reputation = data.reputation || 0;
        const stats = data.last_analysis_stats || {};

        // Reputation analysis
        if (reputation < -10) {
            analysis.issues.push({
                severity: 'high',
                title: 'Poor Domain Reputation',
                description: `Domain has poor reputation score: ${reputation}`,
                remediation: 'Investigate domain reputation and security posture'
            });
        }

        // Analysis results
        const malicious = stats.malicious || 0;
        const suspicious = stats.suspicious || 0;

        if (malicious > 0) {
            analysis.issues.push({
                severity: 'critical',
                title: 'Malicious Domain Detection',
                description: `${malicious} security vendors flagged this domain as malicious`,
                remediation: 'Immediate investigation required - domain may be compromised'
            });
        }

        if (suspicious > 0) {
            analysis.issues.push({
                severity: 'medium',
                title: 'Suspicious Domain Activity',
                description: `${suspicious} security vendors flagged this domain as suspicious`,
                remediation: 'Monitor domain activity and investigate suspicious behavior'
            });
        }

        // Categories
        const categories = data.categories || {};
        const riskyCategories = Object.keys(categories).filter(cat =>
            cat.toLowerCase().includes('malware') ||
            cat.toLowerCase().includes('phishing') ||
            cat.toLowerCase().includes('suspicious')
        );

        if (riskyCategories.length > 0) {
            analysis.issues.push({
                severity: 'medium',
                title: 'Risky Domain Categories',
                description: `Domain categorized as: ${riskyCategories.join(', ')}`,
                remediation: 'Review domain categorization and security classification'
            });
        }

        return analysis;
    }

    /**
     * Advanced security analysis
     */
    async performSecurityAnalysis(basicInfo, sslLabsResult, externalResults = {}) {
        const analysis = {
            grade: 'T',
            score: 0,
            issues: [],
            vulnerabilities: [],
            recommendations: []
        };

        if (!basicInfo.success) {
            analysis.issues.push({
                severity: 'critical',
                title: 'Certificate Not Found',
                description: 'No SSL certificate found for this domain',
                remediation: 'Ensure SSL certificate is properly installed'
            });
            return analysis;
        }

        const cert = basicInfo.certificate;

        // Certificate validity checks
        if (cert.validity.isExpired) {
            analysis.issues.push({
                severity: 'critical',
                title: 'Certificate Expired',
                description: 'SSL certificate has expired',
                remediation: 'Renew the SSL certificate immediately'
            });
        } else if (cert.validity.isExpiringSoon) {
            analysis.issues.push({
                severity: 'high',
                title: 'Certificate Expiring Soon',
                description: `Certificate expires in ${cert.validity.daysRemaining} days`,
                remediation: 'Renew the SSL certificate before expiry'
            });
        }

        // Self-signed certificate check
        if (cert.issuer.commonName === cert.subject.commonName) {
            analysis.issues.push({
                severity: 'high',
                title: 'Self-Signed Certificate',
                description: 'Certificate is self-signed and not trusted by browsers',
                remediation: 'Replace with certificate from trusted Certificate Authority'
            });
        }

        // Weak key size check
        if (cert.publicKey.size < 2048) {
            analysis.issues.push({
                severity: 'high',
                title: 'Weak Key Size',
                description: `RSA key size ${cert.publicKey.size} is below recommended 2048 bits`,
                remediation: 'Regenerate certificate with at least 2048-bit key'
            });
        }

        // Protocol checks
        const insecureProtocols = basicInfo.protocols.filter(p => !p.secure);
        if (insecureProtocols.length > 0) {
            analysis.issues.push({
                severity: 'medium',
                title: 'Insecure Protocols Supported',
                description: `Server supports insecure protocols: ${insecureProtocols.map(p => p.name).join(', ')}`,
                remediation: 'Disable SSL 2.0, SSL 3.0, and TLS 1.0/1.1'
            });
        }

        // SSL Labs grade integration
        if (sslLabsResult.available && sslLabsResult.grade) {
            analysis.grade = sslLabsResult.grade;
            analysis.score = sslLabsResult.score;
        }

        // Integrate external API results
        if (externalResults.censys && externalResults.censys.available) {
            analysis.issues.push(...(externalResults.censys.analysis?.issues || []));
            analysis.recommendations.push(...(externalResults.censys.analysis?.recommendations || []));
        }

        if (externalResults.shodan && externalResults.shodan.available) {
            analysis.issues.push(...(externalResults.shodan.analysis?.issues || []));
            analysis.recommendations.push(...(externalResults.shodan.analysis?.recommendations || []));
        }

        if (externalResults.virusTotal && externalResults.virusTotal.available) {
            analysis.issues.push(...(externalResults.virusTotal.analysis?.issues || []));
            analysis.recommendations.push(...(externalResults.virusTotal.analysis?.recommendations || []));
        }

        // Calculate final grade if not from SSL Labs
        if (!sslLabsResult.available || !sslLabsResult.grade) {
            analysis.grade = this.calculateGrade(analysis.issues);
            analysis.score = this.gradeToScore(analysis.grade);
        }

        // Add recommendations based on analysis
        this.addSecurityRecommendations(analysis);

        return analysis;
    }

    calculateGrade(issues) {
        const criticalCount = issues.filter(i => i.severity === 'critical').length;
        const highCount = issues.filter(i => i.severity === 'high').length;
        const mediumCount = issues.filter(i => i.severity === 'medium').length;

        if (criticalCount > 0) return 'F';
        if (highCount > 2) return 'F';
        if (highCount > 0) return 'C';
        if (mediumCount > 2) return 'B';
        if (mediumCount > 0) return 'A-';
        return 'A+';
    }

    gradeToScore(grade) {
        const gradeMap = {
            'A+': 100,
            'A': 95,
            'A-': 90,
            'B+': 85,
            'B': 80,
            'B-': 75,
            'C+': 70,
            'C': 65,
            'C-': 60,
            'D+': 55,
            'D': 50,
            'D-': 45,
            'F': 35,
            'T': 0
        };
        return gradeMap[grade] || 0;
    }

    addSecurityRecommendations(analysis) {
        const recommendations = [];

        // Certificate recommendations
        if (analysis.issues.some(i => i.title.includes('Certificate'))) {
            recommendations.push({
                priority: 'high',
                title: 'Certificate Management',
                description: 'Implement automated certificate renewal and monitoring',
                actions: [
                    'Set up certificate expiry alerts 30 days in advance',
                    'Configure auto-renewal with your Certificate Authority',
                    'Implement certificate pinning for critical domains'
                ]
            });
        }

        // Protocol recommendations
        if (analysis.issues.some(i => i.title.includes('Protocol'))) {
            recommendations.push({
                priority: 'high',
                title: 'Protocol Security',
                description: 'Disable insecure SSL/TLS protocols',
                actions: [
                    'Disable SSL 2.0 and SSL 3.0 completely',
                    'Disable TLS 1.0 and TLS 1.1',
                    'Enable only TLS 1.2 and TLS 1.3',
                    'Configure cipher suite preferences'
                ]
            });
        }

        // Key strength recommendations
        if (analysis.issues.some(i => i.title.includes('Key'))) {
            recommendations.push({
                priority: 'medium',
                title: 'Key Strength',
                description: 'Upgrade to stronger cryptographic keys',
                actions: [
                    'Use RSA 2048-bit or ECDSA keys',
                    'Consider migrating to ECDSA for better performance',
                    'Implement proper key rotation policies'
                ]
            });
        }

        // General security recommendations
        recommendations.push({
            priority: 'medium',
            title: 'Security Monitoring',
            description: 'Implement continuous SSL monitoring',
            actions: [
                'Set up daily certificate health checks',
                'Monitor for certificate transparency logs',
                'Implement automated vulnerability scanning',
                'Configure alerts for security events'
            ]
        });

        analysis.recommendations.push(...recommendations);
    }

    /**
     * Compliance checking
     */
    async performComplianceCheck(domain, basicInfo) {
        const compliance = {
            pciDss: { compliant: false, issues: [] },
            hipaa: { compliant: false, issues: [] },
            gdpr: { compliant: false, issues: [] },
            sox: { compliant: false, issues: [] }
        };

        if (!basicInfo.success) {
            const issue = 'No SSL certificate found';
            Object.keys(compliance).forEach(standard => {
                compliance[standard].issues.push(issue);
            });
            return compliance;
        }

        const cert = basicInfo.certificate;

        // PCI DSS compliance
        if (cert.validity.daysRemaining < 30) {
            compliance.pciDss.issues.push('Certificate expires within 30 days');
        }
        if (cert.publicKey.size < 2048) {
            compliance.pciDss.issues.push('Key size must be at least 2048 bits');
        }
        compliance.pciDss.compliant = compliance.pciDss.issues.length === 0;

        // HIPAA compliance
        if (!cert.subject.organizationName) {
            compliance.hipaa.issues.push('Certificate must include organization name');
        }
        if (cert.validity.daysRemaining < 365) {
            compliance.hipaa.issues.push('Certificate must be valid for at least 1 year');
        }
        compliance.hipaa.compliant = compliance.hipaa.issues.length === 0;

        // GDPR compliance
        if (cert.issuer.country !== 'EU' && !this.isEUPlusAdequate(cert.issuer.country)) {
            compliance.gdpr.issues.push('Certificate issuer must be from adequate jurisdiction');
        }
        compliance.gdpr.compliant = compliance.gdpr.issues.length === 0;

        // SOX compliance
        if (!cert.validity.notBefore || !cert.validity.notAfter) {
            compliance.sox.issues.push('Certificate must have valid date range');
        }
        compliance.sox.compliant = compliance.sox.issues.length === 0;

        return compliance;
    }

    /**
     * Parse certificate data
     */
    parseCertificate(cert, hostname, port) {
        const now = new Date();
        const notAfter = new Date(cert.valid_until);
        const notBefore = new Date(cert.valid_from);
        const daysRemaining = Math.ceil((notAfter - now) / (1000 * 60 * 60 * 24));

        return {
            subject: {
                commonName: cert.subject.CN || hostname,
                organizationName: cert.subject.O,
                organizationalUnit: cert.subject.OU,
                country: cert.subject.C,
                state: cert.subject.ST,
                locality: cert.subject.L,
                emailAddress: cert.subject.emailAddress
            },
            issuer: {
                commonName: cert.issuer.CN,
                organizationName: cert.issuer.O,
                organizationalUnit: cert.issuer.OU,
                country: cert.issuer.C,
                emailAddress: cert.issuer.emailAddress
            },
            validity: {
                notBefore,
                notAfter,
                daysRemaining,
                isExpired: now > notAfter,
                isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0
            },
            serialNumber: cert.serialNumber,
            version: cert.version,
            fingerprints: {
                sha256: cert.fingerprint256 || this.generateFingerprint(cert.raw, 'sha256'),
                sha1: cert.fingerprint || this.generateFingerprint(cert.raw, 'sha1'),
                md5: this.generateFingerprint(cert.raw, 'md5')
            },
            publicKey: {
                algorithm: cert.pubkey?.type || 'unknown',
                size: cert.pubkey?.bits || 0,
                curve: cert.pubkey?.curve,
                exponent: cert.pubkey?.exponent,
                modulus: cert.pubkey?.modulus
            },
            signatureAlgorithm: cert.sigalg,
            rawCertificate: cert.raw?.toString('base64')
        };
    }

    /**
     * Parse certificate chain
     */
    parseChain(cert) {
        const chain = [];

        if (cert.issuerCertificate) {
            chain.push({
                subject: cert.issuerCertificate.subject?.CN,
                issuer: cert.issuerCertificate.issuer?.CN,
                fingerprint: cert.issuerCertificate.fingerprint,
                isIntermediate: true
            });
        }

        return chain;
    }

    /**
     * Get supported protocols
     */
    async getSupportedProtocols(hostname, port) {
        const protocols = [
            { name: 'TLS 1.3', version: 'TLSv1.3', supported: false, secure: true },
            { name: 'TLS 1.2', version: 'TLSv1.2', supported: false, secure: true },
            { name: 'TLS 1.1', version: 'TLSv1.1', supported: false, secure: false },
            { name: 'TLS 1.0', version: 'TLSv1', supported: false, secure: false },
            { name: 'SSL 3.0', version: 'SSLv3', supported: false, secure: false },
            { name: 'SSL 2.0', version: 'SSLv2', supported: false, secure: false }
        ];

        // Test each protocol
        for (const protocol of protocols) {
            try {
                const result = await this.testProtocol(hostname, port, protocol.version);
                protocol.supported = result.supported;
            } catch (error) {
                protocol.supported = false;
            }
        }

        return protocols;
    }

    /**
     * Test specific protocol support
     */
    testProtocol(hostname, port, protocol) {
        return new Promise((resolve) => {
            const options = {
                host: hostname,
                port: port,
                servername: hostname,
                rejectUnauthorized: false,
                secureProtocol: protocol,
                timeout: 5000
            };

            const socket = tls.connect(options, () => {
                socket.end();
                resolve({ supported: true });
            });

            socket.on('error', () => {
                resolve({ supported: false });
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve({ supported: false });
            });
        });
    }

    /**
     * Get supported cipher suites
     */
    async getSupportedCiphers(hostname, port) {
        // This is a simplified implementation
        // In production, you'd test each cipher suite individually
        return [
            { name: 'ECDHE-RSA-AES256-GCM-SHA384', strength: 'strong', forwardSecrecy: true, supported: true },
            { name: 'ECDHE-RSA-AES128-GCM-SHA256', strength: 'strong', forwardSecrecy: true, supported: true },
            { name: 'AES256-GCM-SHA384', strength: 'medium', forwardSecrecy: false, supported: true },
            { name: 'AES128-GCM-SHA256', strength: 'medium', forwardSecrecy: false, supported: true }
        ];
    }

    /**
     * Calculate certificate grade
     */
    calculateGrade(issues) {
        const critical = issues.filter(i => i.severity === 'critical').length;
        const high = issues.filter(i => i.severity === 'high').length;
        const medium = issues.filter(i => i.severity === 'medium').length;

        if (critical > 0) return 'F';
        if (high > 0) return 'C';
        if (medium > 0) return 'B';
        return 'A';
    }

    /**
     * Convert grade to numeric score
     */
    gradeToScore(grade) {
        const scores = { 'A+': 100, 'A': 95, 'A-': 90, 'B': 80, 'C': 60, 'D': 40, 'F': 20, 'T': 0 };
        return scores[grade] || 0;
    }

    /**
     * Generate certificate fingerprint
     */
    generateFingerprint(rawCert, algorithm) {
        try {
            const certBuffer = Buffer.isBuffer(rawCert) ? rawCert : Buffer.from(rawCert, 'base64');
            return crypto.createHash(algorithm).update(certBuffer).digest('hex').toUpperCase();
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if country is EU adequate
     */
    isEUPlusAdequate(country) {
        const adequateCountries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH', 'IS', 'NO', 'LI'];
        return adequateCountries.includes(country);
    }

    /**
     * Rate limiting check
     */
    isRateLimited(service) {
        const now = Date.now();
        const limit = this.rateLimits.get(service);

        if (!limit) return false;

        if (now - limit.lastRequest < limit.window) {
            limit.requests++;
            if (limit.requests > limit.max) {
                return true;
            }
        } else {
            limit.requests = 1;
            limit.lastRequest = now;
        }

        return false;
    }

    /**
     * Update scan progress
     */
    updateScanProgress(scanId, progress, status) {
        const scan = this.scanQueue.get(scanId);
        if (scan) {
            scan.progress = progress;
            scan.status = status;
        }

        if (global.wsServer) {
            global.wsServer.notifyScanProgress(scanId, progress, status);
        }
    }

    /**
     * Save scan results to database
     */
    async saveScanResults(domain, scanResult) {
        try {
            const certificateData = {
                domain,
                hostname: domain,
                port: 443,
                ...scanResult.results.basic.certificate,
                security: scanResult.results.security,
                certificateTransparency: scanResult.results.certificateTransparency,
                compliance: scanResult.results.compliance,
                lastScannedAt: new Date(),
                scanHistory: [{
                    scanId: scanResult.scanId,
                    timestamp: scanResult.startTime,
                    scanner: 'comprehensive',
                    duration: scanResult.duration,
                    status: 'success',
                    grade: scanResult.results.security.grade,
                    score: scanResult.results.security.score,
                    issuesFound: scanResult.results.security.issues.length
                }]
            };

            await Certificate.findOneAndUpdate(
                { domain },
                certificateData,
                { upsert: true, new: true }
            );

            console.log(`💾 Saved scan results for ${domain}`);

        } catch (error) {
            console.error('Error saving scan results:', error);
        }
    }

    /**
     * Legacy scan method for backward compatibility
     */
    async scanCertificate(hostname, port = 443) {
        const basicScan = await this.performBasicScan(hostname, port);
        return {
            success: basicScan.success,
            certificate: basicScan.certificate,
            chain: basicScan.chain,
            protocol: basicScan.protocol,
            cipher: basicScan.cipher
        };
    }
}

module.exports = new SSLService();
                    success: true,
                    certificate: {
                        ...certificate,
                        chain,
                        security
                    },
                    connection: {
                        connected: true,
                        protocol,
                        cipher: cipher?.name,
                        peerCertificate: true
                    },
                    duration: Date.now() - startTime
                });
            });
            
            socket.on('error', (err) => {
                resolve({
                    success: false,
                    status: 'failed',
                    error: err.message,
                    errors: [{ code: err.code, message: err.message }],
                    duration: Date.now() - startTime
                });
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve({
                    success: false,
                    status: 'timeout',
                    error: 'Connection timeout',
                    duration: Date.now() - startTime
                });
            });
        });
    },
    
    /**
     * Parse certificate data
     */
    parseCertificate(cert, hostname, port) {
        const now = new Date();
        const notAfter = new Date(cert.valid_to);
        const notBefore = new Date(cert.valid_from);
        const daysRemaining = Math.ceil((notAfter - now) / (1000 * 60 * 60 * 24));
        
        return {
            domain: hostname,
            hostname,
            port,
            subject: {
                commonName: cert.subject?.CN,
                organization: cert.subject?.O,
                organizationalUnit: cert.subject?.OU,
                country: cert.subject?.C,
                state: cert.subject?.ST,
                locality: cert.subject?.L
            },
            issuer: {
                commonName: cert.issuer?.CN,
                organization: cert.issuer?.O,
                country: cert.issuer?.C
            },
            validity: {
                notBefore,
                notAfter,
                daysRemaining,
                isExpired: daysRemaining <= 0,
                isExpiringSoon: daysRemaining <= 30 && daysRemaining > 0
            },
            serialNumber: cert.serialNumber,
            fingerprints: {
                sha256: cert.fingerprint256,
                sha1: cert.fingerprint
            },
            publicKey: {
                algorithm: cert.pubkey ? 'RSA' : 'Unknown',
                size: cert.bits || cert.modulus?.length * 4
            },
            signature: {
                algorithm: cert.sigalg || 'Unknown'
            },
            extensions: {
                subjectAltNames: cert.subjectaltname 
                    ? cert.subjectaltname.split(',').map(s => s.trim().replace('DNS:', ''))
                    : [hostname]
            },
            lastScanned: now,
            status: daysRemaining <= 0 ? 'expired' 
                : daysRemaining <= 7 ? 'expiring'
                : 'valid'
        };
    },
    
    /**
     * Parse certificate chain
     */
    parseChain(cert) {
        const chain = [];
        let current = cert;
        
        while (current) {
            chain.push({
                subject: current.subject?.CN || 'Unknown',
                issuer: current.issuer?.CN || 'Unknown',
                notAfter: new Date(current.valid_to),
                fingerprint: current.fingerprint256
            });
            
            current = current.issuerCertificate;
            
            // Prevent infinite loop
            if (chain.length > 10 || 
                (current && current.fingerprint256 === cert.fingerprint256)) {
                break;
            }
        }
        
        return chain;
    },
    
    /**
     * Analyze security
     */
    analyzeSecurity(certificate, protocol, cipher) {
        const issues = [];
        let score = 100;
        
        // Check expiration
        if (certificate.validity.isExpired) {
            issues.push({
                severity: 'critical',
                type: 'expired',
                description: 'Certificate has expired'
            });
            score -= 50;
        } else if (certificate.validity.daysRemaining <= 7) {
            issues.push({
                severity: 'high',
                type: 'expiring_soon',
                description: `Certificate expires in ${certificate.validity.daysRemaining} days`
            });
            score -= 20;
        } else if (certificate.validity.daysRemaining <= 30) {
            issues.push({
                severity: 'medium',
                type: 'expiring_soon',
                description: `Certificate expires in ${certificate.validity.daysRemaining} days`
            });
            score -= 10;
        }
        
        // Check key size
        if (certificate.publicKey.size && certificate.publicKey.size < 2048) {
            issues.push({
                severity: 'high',
                type: 'weak_key',
                description: `Weak key size: ${certificate.publicKey.size} bits`
            });
            score -= 15;
        }
        
        // Check protocol
        if (protocol === 'TLSv1' || protocol === 'TLSv1.1') {
            issues.push({
                severity: 'medium',
                type: 'deprecated_protocol',
                description: `Using deprecated protocol: ${protocol}`
            });
            score -= 10;
        }
        
        // Check cipher
        const weakCiphers = ['DES', '3DES', 'RC4', 'MD5'];
        if (cipher && weakCiphers.some(c => cipher.name?.includes(c))) {
            issues.push({
                severity: 'high',
                type: 'weak_cipher',
                description: `Weak cipher: ${cipher.name}`
            });
            score -= 15;
        }
        
        score = Math.max(0, score);
        
        return {
            grade: this.scoreToGrade(score),
            score,
            issues
        };
    },
    
    /**
     * Convert score to grade
     */
    scoreToGrade(score) {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'A-';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    },
    
    /**
     * Save certificate to database
     */
    async saveCertificate(certData) {
        const certificate = await Certificate.findOneAndUpdate(
            { domain: certData.domain, port: certData.port },
            { $set: certData },
            { upsert: true, new: true }
        );
        
        // Check for alerts
        await this.checkAlerts(certificate);
        
        return certificate;
    },
    
    /**
     * Quick check certificate
     */
    async quickCheck(hostname, port = 443) {
        const result = await this.scanCertificate(hostname, port);
        
        if (!result.success) {
            return {
                valid: false,
                error: result.error
            };
        }
        
        const cert = result.certificate;
        return {
            valid: cert.status === 'valid',
            domain: cert.domain,
            issuer: cert.issuer.organization || cert.issuer.commonName,
            expiresAt: cert.validity.notAfter,
            daysRemaining: cert.validity.daysRemaining,
            grade: cert.security.grade,
            issues: cert.security.issues.length
        };
    },
    
    /**
     * Scan and update domain
     */
    async scanAndUpdateDomain(domain) {
        const results = [];
        
        for (const endpoint of domain.endpoints) {
            if (!endpoint.enabled) continue;
            
            const result = await this.scanCertificate(
                endpoint.hostname || domain.domain,
                endpoint.port || 443
            );
            
            if (result.success) {
                const certificate = await this.saveCertificate(result.certificate);
                domain.certificate = certificate._id;
                results.push({ endpoint, success: true, certificate });
            } else {
                results.push({ endpoint, success: false, error: result.error });
            }
        }
        
        // Update domain
        domain.monitoring.lastScanned = new Date();
        domain.monitoring.nextScan = new Date(Date.now() + domain.monitoring.interval * 60 * 60 * 1000);
        domain.history.push({
            timestamp: new Date(),
            event: 'scan_completed',
            details: { results: results.length }
        });
        
        await domain.save();
        
        return {
            domain: domain.domain,
            results,
            nextScan: domain.monitoring.nextScan
        };
    },
    
    /**
     * Check and create alerts
     */
    async checkAlerts(certificate) {
        const alerts = [];
        
        // Expiration alerts
        if (certificate.validity.isExpired) {
            alerts.push({
                type: 'expired',
                severity: 'critical',
                domain: certificate.domain,
                certificate: certificate._id,
                title: `Certificate Expired: ${certificate.domain}`,
                message: `The SSL certificate for ${certificate.domain} has expired.`
            });
        } else if (certificate.validity.daysRemaining <= 7) {
            alerts.push({
                type: 'expiring_soon',
                severity: 'critical',
                domain: certificate.domain,
                certificate: certificate._id,
                title: `Certificate Expiring: ${certificate.domain}`,
                message: `Certificate expires in ${certificate.validity.daysRemaining} days.`,
                details: { daysRemaining: certificate.validity.daysRemaining }
            });
        } else if (certificate.validity.daysRemaining <= 30) {
            alerts.push({
                type: 'expiring_soon',
                severity: 'high',
                domain: certificate.domain,
                certificate: certificate._id,
                title: `Certificate Expiring Soon: ${certificate.domain}`,
                message: `Certificate expires in ${certificate.validity.daysRemaining} days.`,
                details: { daysRemaining: certificate.validity.daysRemaining }
            });
        }
        
        // Security issue alerts
        const criticalIssues = certificate.security.issues.filter(i => 
            i.severity === 'critical' || i.severity === 'high'
        );
        
        if (criticalIssues.length > 0) {
            alerts.push({
                type: 'security_issue',
                severity: 'high',
                domain: certificate.domain,
                certificate: certificate._id,
                title: `Security Issues: ${certificate.domain}`,
                message: `${criticalIssues.length} security issues found.`,
                details: { issues: criticalIssues }
            });
        }
        
        // Create alerts
        for (const alertData of alerts) {
            await Alert.findOneAndUpdate(
                { 
                    domain: alertData.domain, 
                    type: alertData.type,
                    status: 'active'
                },
                { $set: alertData },
                { upsert: true }
            );
        }
        
        return alerts;
    },

    // Integration with external security stack
    async integrateWithSecurityStack(scanId, scanData) {
        try {
            const connectors = getConnectors();
            const integrationPromises = [];

            // Microsoft Sentinel - Log SSL certificate issues
            if (connectors.sentinel) {
                integrationPromises.push(
                    connectors.sentinel.ingestData({
                        table: 'SSLCertificate_CL',
                        data: {
                            ScanId: scanId,
                            Domain: scanData.domain,
                            Issuer: scanData.issuer,
                            ExpiryDate: scanData.expiryDate,
                            DaysUntilExpiry: scanData.daysUntilExpiry,
                            SecurityIssues: scanData.securityIssues?.length || 0,
                            CriticalIssues: scanData.criticalIssues?.length || 0,
                            Timestamp: new Date().toISOString(),
                            Source: 'SSLMonitor'
                        }
                    }).catch(err => console.error('Sentinel integration failed:', err.message))
                );
            }

            // Cortex XSOAR - Create incident for expiring or compromised certificates
            if (connectors.cortexXSOAR && (scanData.daysUntilExpiry < 30 || scanData.criticalIssues > 0)) {
                integrationPromises.push(
                    connectors.cortexXSOAR.createIncident({
                        name: `SSL Certificate Issue - ${scanData.domain}`,
                        type: 'SSL Certificate',
                        severity: scanData.criticalIssues > 0 ? 'Critical' : 'High',
                        details: {
                            scanId,
                            domain: scanData.domain,
                            expiryDate: scanData.expiryDate,
                            daysUntilExpiry: scanData.daysUntilExpiry,
                            securityIssues: scanData.securityIssues,
                            criticalIssues: scanData.criticalIssues
                        }
                    }).catch(err => console.error('XSOAR integration failed:', err.message))
                );
            }

            // Cloudflare - Update SSL/TLS settings for affected domains
            if (connectors.cloudflare && scanData.securityIssues?.length > 0) {
                integrationPromises.push(
                    connectors.cloudflare.updateSSLSettings({
                        zoneId: scanData.zoneId,
                        settings: {
                            ssl: 'strict',
                            tls_1_2_only: true,
                            min_tls_version: '1.2'
                        }
                    }).catch(err => console.error('Cloudflare SSL settings update failed:', err.message))
                );
            }

            await Promise.allSettled(integrationPromises);
            console.log('SSLMonitor security stack integration completed');

        } catch (error) {
            console.error('SSLMonitor integration error:', error);
        }
    }
};

module.exports = sslService;
