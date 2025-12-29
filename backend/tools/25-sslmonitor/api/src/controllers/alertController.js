/**
 * Alert Controller - SSL/TLS alerts management
 */

const Alert = require('../models/Alert');

const alertController = {
    // Get all alerts
    async getAll(req, res) {
        try {
            const { 
                status, severity, type, domain,
                page = 1, limit = 50 
            } = req.query;
            
            const query = {};
            
            if (status) query.status = status;
            if (severity) query.severity = severity;
            if (type) query.type = type;
            if (domain) query.domain = new RegExp(domain, 'i');
            
            const skip = (page - 1) * limit;
            
            const [alerts, total] = await Promise.all([
                Alert.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                Alert.countDocuments(query)
            ]);
            
            res.json({
                success: true,
                data: alerts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Get alert by ID
    async getById(req, res) {
        try {
            const alert = await Alert.findOne({
                $or: [
                    { _id: req.params.id },
                    { alertId: req.params.id }
                ]
            }).populate('certificate');
            
            if (!alert) {
                return res.status(404).json({ success: false, error: 'Alert not found' });
            }
            
            res.json({ success: true, data: alert });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Acknowledge alert
    async acknowledge(req, res) {
        try {
            const { acknowledgedBy } = req.body;
            
            const alert = await Alert.findOneAndUpdate(
                { $or: [{ _id: req.params.id }, { alertId: req.params.id }] },
                {
                    $set: {
                        acknowledged: true,
                        acknowledgedBy,
                        acknowledgedAt: new Date(),
                        status: 'acknowledged'
                    }
                },
                { new: true }
            );
            
            if (!alert) {
                return res.status(404).json({ success: false, error: 'Alert not found' });
            }
            
            res.json({ success: true, data: alert });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Update alert settings
    async updateSettings(req, res) {
        try {
            // This would typically update global alert settings
            const { settings } = req.body;
            
            res.json({
                success: true,
                message: 'Alert settings updated',
                data: settings
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = alertController;
