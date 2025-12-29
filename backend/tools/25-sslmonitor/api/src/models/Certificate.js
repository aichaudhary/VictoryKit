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
    domain: {
        type: String,
        required: true,
        index: true
    },
    hostname: String,
    port: {
        type: Number,
        default: 443
    },
    subject: {
        commonName: String,
        organization: String,
        organizationalUnit: String,
        country: String,
        state: String,
        locality: String
    },
    issuer: {
        commonName: String,
        organization: String,
        country: String
    },
    validity: {
        notBefore: Date,
        notAfter: Date,
        daysRemaining: Number,
        isExpired: { type: Boolean, default: false },
        isExpiringSoon: { type: Boolean, default: false }
    },
    serialNumber: String,
    fingerprints: {
        sha256: String,
        sha1: String,
        md5: String
    },
    publicKey: {
        algorithm: String,
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
