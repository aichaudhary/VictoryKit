/**
 * ScanResult Model - Certificate scan results
 */

const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
    scanId: {
        type: String,
        unique: true,
        default: () => `SCN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    },
    domain: {
        type: String,
        required: true,
        index: true
    },
    hostname: String,
    port: { type: Number, default: 443 },
    status: {
        type: String,
        enum: ['success', 'failed', 'timeout', 'unreachable'],
        required: true
    },
    duration: Number, // milliseconds
    connection: {
        connected: Boolean,
        protocol: String,
        cipher: String,
        peerCertificate: Boolean
    },
    certificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate'
    },
    errors: [{
        code: String,
        message: String
    }],
    rawData: mongoose.Schema.Types.Mixed
}, {
    timestamps: true
});

// TTL index - auto-delete after 90 days
scanResultSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ScanResult', scanResultSchema);
