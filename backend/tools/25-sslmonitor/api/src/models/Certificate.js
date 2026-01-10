/**
 * Certificate Model - SSL/TLS certificate records
 */

const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certificateId: {
        type: String,
        unique: true,
        default: () => `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },

    // Basic Certificate Information
    domain: {
        type: String,
        required: true,
        index: true
    },
    hostname: {
        type: String,
        index: true
    },
    port: {
        type: Number,
        default: 443
    },
    ipAddress: String,

    // Certificate Subject Information
    subject: {
        commonName: String,
        organizationName: String,
        organizationalUnit: String,
        country: String,
        state: String,
        locality: String,
        emailAddress: String
    },

    // Certificate Issuer Information
    issuer: {
        commonName: String,
        organizationName: String,
        organizationalUnit: String,
        country: String,
        emailAddress: String
    },

    // Certificate Validity
    validity: {
        notBefore: Date,
        notAfter: Date,
        daysRemaining: Number,
        isExpired: { type: Boolean, default: false },
        isExpiringSoon: { type: Boolean, default: false },
        expiryWarningDays: { type: Number, default: 30 }
    },

    // Certificate Details
    serialNumber: String,
    version: Number,

    // Fingerprints and Hashes
    fingerprints: {
        sha256: String,
        sha1: String,
        md5: String,
        sha384: String,
        sha512: String
    },

    // Public Key Information
    publicKey: {
        algorithm: String,
        size: Number,
        curve: String,
        exponent: String,
        modulus: String
    },

    // Signature Information
    signatureAlgorithm: String,
    signatureHashAlgorithm: String,

    // Certificate Chain
    certificateChain: [{
        subject: String,
        issuer: String,
        fingerprint: String,
        isRoot: { type: Boolean, default: false },
        isIntermediate: { type: Boolean, default: false }
    }],

    // Security Analysis
    security: {
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B', 'C', 'D', 'F', 'T'],
            default: 'T'
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        issues: [{
            severity: {
                type: String,
                enum: ['info', 'low', 'medium', 'high', 'critical']
            },
            title: String,
            description: String,
            cve: String,
            remediation: String,
            references: [String]
        }],
        vulnerabilities: [{
            cve: String,
            severity: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical']
            },
            description: String,
            cvssScore: Number,
            publishedDate: Date,
            lastModifiedDate: Date
        }],
        cipherSuites: [{
            name: String,
            strength: String,
            forwardSecrecy: Boolean,
            supported: Boolean
        }],
        protocols: [{
            name: String,
            version: String,
            supported: Boolean,
            secure: Boolean
        }],
        hsts: {
            enabled: { type: Boolean, default: false },
            maxAge: Number,
            includeSubdomains: { type: Boolean, default: false },
            preload: { type: Boolean, default: false }
        },
        hpkp: {
            enabled: { type: Boolean, default: false },
            pins: [String],
            maxAge: Number,
            includeSubdomains: { type: Boolean, default: false },
            reportUri: String
        }
    },

    // Certificate Transparency
    certificateTransparency: {
        logged: { type: Boolean, default: false },
        logEntries: [{
            logId: String,
            logName: String,
            timestamp: Date,
            index: Number,
            sct: String
        }],
        scts: [{
            version: Number,
            logId: String,
            timestamp: Date,
            extensions: String,
            signature: String
        }]
    },

    // OCSP and CRL Information
    revocation: {
        ocsp: {
            url: String,
            status: {
                type: String,
                enum: ['good', 'revoked', 'unknown']
            },
            lastChecked: Date,
            nextUpdate: Date,
            producedAt: Date
        },
        crl: {
            url: String,
            lastChecked: Date,
            nextUpdate: Date,
            revoked: { type: Boolean, default: false },
            revocationDate: Date,
            revocationReason: String
        }
    },

    // DNS and CAA Information
    dns: {
        caaRecords: [{
            flags: Number,
            tag: String,
            value: String,
            issuer: String
        }],
        dnssec: {
            enabled: { type: Boolean, default: false },
            algorithm: String,
            keySize: Number,
            valid: { type: Boolean, default: false }
        },
        spf: {
            record: String,
            valid: { type: Boolean, default: false }
        },
        dkim: {
            selector: String,
            record: String,
            valid: { type: Boolean, default: false }
        },
        dmarc: {
            record: String,
            policy: String,
            valid: { type: Boolean, default: false }
        }
    },

    // Compliance Information
    compliance: {
        pciDss: {
            compliant: { type: Boolean, default: false },
            issues: [String],
            lastChecked: Date
        },
        hipaa: {
            compliant: { type: Boolean, default: false },
            issues: [String],
            lastChecked: Date
        },
        gdpr: {
            compliant: { type: Boolean, default: false },
            issues: [String],
            lastChecked: Date
        },
        sox: {
            compliant: { type: Boolean, default: false },
            issues: [String],
            lastChecked: Date
        },
        iso27001: {
            compliant: { type: Boolean, default: false },
            issues: [String],
            lastChecked: Date
        }
    },

    // Monitoring Configuration
    monitoring: {
        enabled: { type: Boolean, default: true },
        frequency: {
            type: String,
            enum: ['hourly', 'daily', 'weekly', 'monthly'],
            default: 'daily'
        },
        alertThreshold: {
            type: Number,
            default: 30,
            min: 1,
            max: 365
        },
        notifyOnChanges: { type: Boolean, default: true },
        notifyOnExpiry: { type: Boolean, default: true },
        notifyOnIssues: { type: Boolean, default: true }
    },

    // Scan History
    scanHistory: [{
        scanId: String,
        timestamp: Date,
        scanner: String,
        duration: Number,
        status: {
            type: String,
            enum: ['success', 'failed', 'partial']
        },
        grade: String,
        score: Number,
        issuesFound: Number,
        changes: [{
            field: String,
            oldValue: mongoose.Schema.Types.Mixed,
            newValue: mongoose.Schema.Types.Mixed,
            severity: String
        }]
    }],

    // Tags and Categories
    tags: [String],
    categories: [{
        name: String,
        color: String
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    // Ownership and Management
    owner: {
        userId: String,
        email: String,
        department: String,
        contact: String
    },

    // Automated Renewal
    renewal: {
        enabled: { type: Boolean, default: false },
        provider: {
            type: String,
            enum: ['letsencrypt', 'digicert', 'globalsign', 'sectigo', 'entrust', 'manual']
        },
        apiKey: String,
        lastRenewalAttempt: Date,
        nextRenewalDate: Date,
        renewalHistory: [{
            date: Date,
            status: String,
            error: String,
            certificateId: String
        }]
    },

    // Metadata
    source: {
        type: String,
        enum: ['manual', 'auto-discovery', 'api', 'import'],
        default: 'manual'
    },
    discoveredAt: Date,
    lastScannedAt: Date,
    lastUpdatedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },

    // Raw Certificate Data (for debugging)
    rawCertificate: String,
    rawChain: [String]
}, {
    timestamps: true,
    collection: 'certificates'
});

// Indexes for performance
certificateSchema.index({ domain: 1, port: 1 });
certificateSchema.index({ 'validity.notAfter': 1 });
certificateSchema.index({ 'security.grade': 1 });
certificateSchema.index({ 'monitoring.enabled': 1 });
certificateSchema.index({ tags: 1 });
certificateSchema.index({ 'owner.userId': 1 });
certificateSchema.index({ lastScannedAt: 1 });
certificateSchema.index({ 'compliance.pciDss.compliant': 1 });
certificateSchema.index({ 'compliance.hipaa.compliant': 1 });
certificateSchema.index({ 'compliance.gdpr.compliant': 1 });

// Virtual for days until expiry
certificateSchema.virtual('daysUntilExpiry').get(function() {
    if (!this.validity.notAfter) return null;
    const now = new Date();
    const expiry = new Date(this.validity.notAfter);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance methods
certificateSchema.methods.isExpiringSoon = function(days = 30) {
    return this.daysUntilExpiry <= days && this.daysUntilExpiry > 0;
};

certificateSchema.methods.getSecurityDashboard = function() {
    // Calculate security score based on various factors
    let score = 0;

    // Grade-based scoring
    const gradeScores = { 'A+': 100, 'A': 95, 'A-': 90, 'B': 80, 'C': 60, 'D': 40, 'F': 20, 'T': 0 };
    score += gradeScores[this.security.grade] || 0;

    // Protocol support
    const secureProtocols = this.security.protocols.filter(p => p.secure && p.supported).length;
    score += (secureProtocols / this.security.protocols.length) * 20;

    // Cipher strength
    const strongCiphers = this.security.cipherSuites.filter(c => c.supported && c.strength === 'strong').length;
    score += (strongCiphers / this.security.cipherSuites.length) * 15;

    // HSTS bonus
    if (this.security.hsts.enabled) score += 10;

    // Issues penalty
    const criticalIssues = this.security.issues.filter(i => i.severity === 'critical').length;
    const highIssues = this.security.issues.filter(i => i.severity === 'high').length;
    score -= (criticalIssues * 20) + (highIssues * 10);

    return Math.max(0, Math.min(100, score));
};

certificateSchema.methods.getComplianceStatus = function() {
    const standards = ['pciDss', 'hipaa', 'gdpr', 'sox', 'iso27001'];
    const compliant = standards.filter(std => this.compliance[std]?.compliant).length;
    return {
        overall: compliant === standards.length,
        score: (compliant / standards.length) * 100,
        standards: standards.map(std => ({
            name: std,
            compliant: this.compliance[std]?.compliant || false,
            lastChecked: this.compliance[std]?.lastChecked
        }))
    };
};

// Static methods
certificateSchema.statics.findExpiringSoon = function(days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.find({
        'validity.notAfter': { $lte: expiryDate, $gt: new Date() },
        'monitoring.enabled': true
    });
};

certificateSchema.statics.findByDomain = function(domain) {
    return this.find({
        $or: [
            { domain: domain },
            { hostname: domain },
            { 'subject.commonName': domain }
        ]
    });
};

certificateSchema.statics.getSecurityOverview = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$security.grade',
                count: { $sum: 1 },
                avgScore: { $avg: '$security.score' }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);
};

module.exports = mongoose.model('Certificate', certificateSchema);
        size: Number,
        curve: String  // For EC keys
    },
    signature: {
        algorithm: String,
        hashAlgorithm: String
    },
    extensions: {
        subjectAltNames: [String],
        keyUsage: [String],
        extendedKeyUsage: [String],
        basicConstraints: {
            isCA: Boolean,
            pathLength: Number
        },
        authorityInfoAccess: {
            ocsp: [String],
            caIssuers: [String]
        },
        crlDistributionPoints: [String]
    },
    chain: [{
        subject: String,
        issuer: String,
        notAfter: Date,
        fingerprint: String
    }],
    security: {
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B', 'C', 'D', 'F', 'T', 'N/A']
        },
        score: {
            type: Number,
            min: 0,
            max: 100
        },
        issues: [{
            severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
            type: String,
            description: String
        }],
        vulnerabilities: [{
            name: String,
            severity: String,
            cve: String
        }]
    },
    protocols: [{
        name: String,
        version: String,
        supported: Boolean,
        secure: Boolean
    }],
    ciphers: [{
        name: String,
        strength: String,
        secure: Boolean
    }],
    ocsp: {
        status: { type: String, enum: ['good', 'revoked', 'unknown', 'error'] },
        lastChecked: Date,
        nextUpdate: Date
    },
    lastScanned: Date,
    status: {
        type: String,
        enum: ['valid', 'expired', 'expiring', 'revoked', 'invalid', 'error'],
        default: 'valid'
    }
}, {
    timestamps: true
});

// Indexes
certificateSchema.index({ 'validity.notAfter': 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ 'security.grade': 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
