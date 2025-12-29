/**
 * Domain Controller - Domain monitoring management
 */

const Domain = require('../models/Domain');
const sslService = require('../services/sslService');

const domainController = {
    // Get all domains
    async getAll(req, res) {
        try {
            const { status, tag, search } = req.query;
            const query = {};
            
            if (status) query.status = status;
            if (tag) query.tags = tag;
            if (search) query.domain = new RegExp(search, 'i');
            
            const domains = await Domain.find(query)
                .populate('certificate', 'validity.notAfter security.grade status')
                .sort({ domain: 1 });
            
            res.json({ success: true, data: domains });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Get domain by ID
    async getById(req, res) {
        try {
            const domain = await Domain.findOne({
                $or: [
                    { _id: req.params.id },
                    { domainId: req.params.id }
                ]
            }).populate('certificate');
            
            if (!domain) {
                return res.status(404).json({ success: false, error: 'Domain not found' });
            }
            
            res.json({ success: true, data: domain });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Create domain
    async create(req, res) {
        try {
            const { domain, endpoints, alerts, tags } = req.body;
            
            // Check if domain exists
            const existing = await Domain.findOne({ domain });
            if (existing) {
                return res.status(400).json({ success: false, error: 'Domain already exists' });
            }
            
            const newDomain = new Domain({
                domain,
                endpoints: endpoints || [{ hostname: domain, port: 443, enabled: true }],
                alerts,
                tags,
                monitoring: {
                    enabled: true,
                    nextScan: new Date()
                }
            });
            
            await newDomain.save();
            
            // Initial scan
            try {
                await sslService.scanAndUpdateDomain(newDomain);
            } catch (e) {
                // Scan failed but domain was created
            }
            
            res.status(201).json({ success: true, data: newDomain });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Update domain
    async update(req, res) {
        try {
            const domain = await Domain.findOneAndUpdate(
                { $or: [{ _id: req.params.id }, { domainId: req.params.id }] },
                { $set: req.body },
                { new: true }
            );
            
            if (!domain) {
                return res.status(404).json({ success: false, error: 'Domain not found' });
            }
            
            res.json({ success: true, data: domain });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Delete domain
    async delete(req, res) {
        try {
            const domain = await Domain.findOneAndDelete({
                $or: [{ _id: req.params.id }, { domainId: req.params.id }]
            });
            
            if (!domain) {
                return res.status(404).json({ success: false, error: 'Domain not found' });
            }
            
            res.json({ success: true, message: 'Domain deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Scan domain
    async scan(req, res) {
        try {
            const domain = await Domain.findOne({
                $or: [{ _id: req.params.id }, { domainId: req.params.id }]
            });
            
            if (!domain) {
                return res.status(404).json({ success: false, error: 'Domain not found' });
            }
            
            const result = await sslService.scanAndUpdateDomain(domain);
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = domainController;
