/**
 * SSL Service - Certificate scanning and analysis
 */

const tls = require('tls');
const https = require('https');
const Certificate = require('../models/Certificate');
const Alert = require('../models/Alert');

const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8025';

const sslService = {
    /**
     * Scan certificate from hostname
     */
    async scanCertificate(hostname, port = 443) {
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const options = {
                host: hostname,
                port: port,
                servername: hostname,
                rejectUnauthorized: false,
                timeout: 10000
            };
            
            const socket = tls.connect(options, () => {
                const cert = socket.getPeerCertificate(true);
                const protocol = socket.getProtocol();
                const cipher = socket.getCipher();
                
                socket.end();
                
                if (!cert || !cert.subject) {
                    resolve({
                        success: false,
                        status: 'failed',
                        error: 'No certificate found',
                        duration: Date.now() - startTime
                    });
                    return;
                }
                
                const certificate = this.parseCertificate(cert, hostname, port);
                const chain = this.parseChain(cert);
                const security = this.analyzeSecurity(certificate, protocol, cipher);
                
                resolve({
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
    }
};

module.exports = sslService;
