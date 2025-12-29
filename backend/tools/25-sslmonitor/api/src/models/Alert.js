/**
 * Alert Model - SSL/TLS alerts
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    alertId: {
        type: String,
        unique: true,
        default: () => `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    type: {
        type: String,
        enum: [
            'expiring_soon',
            'expired',
            'security_issue',
            'grade_change',
            'revoked',
            'chain_issue',
            'protocol_issue',
            'cipher_issue',
            'scan_error'
        ],
        required: true
    },
    severity: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low', 'info'],
        required: true
    },
    domain: {
        type: String,
        required: true,
        index: true
    },
    certificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    },
    title: {
        type: String,
        required: true
    },
    message: String,
    details: {
        daysRemaining: Number,
        oldGrade: String,
        newGrade: String,
        issue: String,
        affectedEndpoints: [String]
    },
    notifications: [{
        channel: { type: String, enum: ['email', 'slack', 'webhook'] },
        recipient: String,
        sentAt: Date,
        status: { type: String, enum: ['sent', 'failed', 'pending'] }
    }],
    acknowledged: {
        type: Boolean,
        default: false
    },
    acknowledgedBy: String,
    acknowledgedAt: Date,
    resolvedAt: Date,
    status: {
        type: String,
        enum: ['active', 'acknowledged', 'resolved', 'dismissed'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes
alertSchema.index({ status: 1, severity: 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);
