/**
 * Certificate Controller - SSL/TLS certificate management
 */

const Certificate = require('../models/Certificate');
const ScanResult = require('../models/ScanResult');
const sslService = require('../services/sslService');

const certificateController = {
    // Get all certificates
    async getAll(req, res) {
        try {
            const { 
                status, grade, domain,
                page = 1, limit = 50 
            } = req.query;
            
            const query = {};
            
            if (status) query.status = status;
            if (grade) query['security.grade'] = grade;
            if (domain) query.domain = new RegExp(domain, 'i');
            
            const skip = (page - 1) * limit;
            
            const [certificates, total] = await Promise.all([
                Certificate.find(query)
                    .sort({ 'validity.notAfter': 1 })
                    .skip(skip)
                    .limit(parseInt(limit)),
                Certificate.countDocuments(query)
            ]);
            
            res.json({
                success: true,
                data: certificates,
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
    
    // Get expiring certificates
    async getExpiring(req, res) {
        try {
            const { days = 30 } = req.query;
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + parseInt(days));
            
            const certificates = await Certificate.find({
                'validity.notAfter': {
                    $gt: new Date(),
                    $lte: expirationDate
                },
                status: { $ne: 'expired' }
            }).sort({ 'validity.notAfter': 1 });
            
            res.json({
                success: true,
                data: certificates,
                count: certificates.length,
                withinDays: parseInt(days)
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Get certificate by ID
    async getById(req, res) {
        try {
            const certificate = await Certificate.findOne({
                $or: [
                    { _id: req.params.id },
                    { certificateId: req.params.id }
                ]
            });
            
            if (!certificate) {
                return res.status(404).json({ success: false, error: 'Certificate not found' });
            }
            
            res.json({ success: true, data: certificate });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Scan domain for certificate
    async scan(req, res) {
        try {
            const { hostname, port = 443 } = req.body;
            
            if (!hostname) {
                return res.status(400).json({ success: false, error: 'Hostname required' });
            }
            
            const result = await sslService.scanCertificate(hostname, port);
            
            if (result.success) {
                // Create or update certificate record
                const certificate = await sslService.saveCertificate(result.certificate);
                
                // Record scan
                await new ScanResult({
                    domain: hostname,
                    hostname,
                    port,
                    status: 'success',
                    duration: result.duration,
                    connection: result.connection,
                    certificate: certificate._id
                }).save();
                
                res.json({
                    success: true,
                    data: certificate
                });
            } else {
                // Record failed scan
                await new ScanResult({
                    domain: hostname,
                    hostname,
                    port,
                    status: result.status,
                    duration: result.duration,
                    errors: result.errors
                }).save();
                
                res.status(400).json({
                    success: false,
                    error: result.error,
                    details: result.errors
                });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Quick check certificate
    async check(req, res) {
        try {
            const { hostname, port = 443 } = req.body;
            
            if (!hostname) {
                return res.status(400).json({ success: false, error: 'Hostname required' });
            }
            
            const result = await sslService.quickCheck(hostname, port);
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Delete certificate
    async delete(req, res) {
        try {
            const certificate = await Certificate.findOneAndDelete({
                $or: [{ _id: req.params.id }, { certificateId: req.params.id }]
            });
            
            if (!certificate) {
                return res.status(404).json({ success: false, error: 'Certificate not found' });
            }
            
            res.json({ success: true, message: 'Certificate deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = certificateController;
