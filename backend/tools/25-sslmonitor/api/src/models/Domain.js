/**
 * Domain Model - Monitored domains
 */

const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
    domainId: {
        type: String,
        unique: true,
        default: () => `DOM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    domain: {
        type: String,
        required: true,
        unique: true
    },
    endpoints: [{
        hostname: String,
        port: { type: Number, default: 443 },
        path: String,
        enabled: { type: Boolean, default: true }
    }],
    monitoring: {
        enabled: { type: Boolean, default: true },
        interval: { type: Number, default: 24 }, // hours
        lastScanned: Date,
        nextScan: Date
    },
    alerts: {
        expirationWarning: { type: Number, default: 30 }, // days
        criticalWarning: { type: Number, default: 7 },    // days
        onExpired: { type: Boolean, default: true },
        onSecurityIssue: { type: Boolean, default: true },
        onGradeChange: { type: Boolean, default: true },
        recipients: [{
            type: { type: String, enum: ['email', 'slack', 'webhook'] },
            value: String,
            enabled: Boolean
        }]
    },
    certificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    },
    history: [{
        timestamp: Date,
        event: String,
        details: mongoose.Schema.Types.Mixed
    }],
    tags: [String],
    owner: String,
    notes: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'error'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes
domainSchema.index({ domain: 'text' });
domainSchema.index({ 'monitoring.nextScan': 1 });
domainSchema.index({ tags: 1 });

module.exports = mongoose.model('Domain', domainSchema);
