/**
 * Analytics Controller - SSL/TLS analytics and dashboard
 */

const Certificate = require('../models/Certificate');
const Domain = require('../models/Domain');
const Alert = require('../models/Alert');
const ScanResult = require('../models/ScanResult');

const analyticsController = {
    // Get overview
    async getOverview(req, res) {
        try {
            const now = new Date();
            const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            
            const [
                totalCertificates,
                expiredCount,
                expiring7days,
                expiring30days,
                gradeACount,
                totalDomains,
                activeDomains,
                activeAlerts
            ] = await Promise.all([
                Certificate.countDocuments(),
                Certificate.countDocuments({ status: 'expired' }),
                Certificate.countDocuments({
                    'validity.notAfter': { $gt: now, $lte: in7days }
                }),
                Certificate.countDocuments({
                    'validity.notAfter': { $gt: now, $lte: in30days }
                }),
                Certificate.countDocuments({
                    'security.grade': { $in: ['A+', 'A'] }
                }),
                Domain.countDocuments(),
                Domain.countDocuments({ status: 'active' }),
                Alert.countDocuments({ status: 'active' })
            ]);
            
            res.json({
                success: true,
                data: {
                    certificates: {
                        total: totalCertificates,
                        expired: expiredCount,
                        expiring7days,
                        expiring30days,
                        gradeA: gradeACount
                    },
                    domains: {
                        total: totalDomains,
                        active: activeDomains
                    },
                    alerts: {
                        active: activeAlerts
                    },
                    health: expiredCount === 0 && expiring7days === 0 ? 'good' : 'warning'
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Get expiration statistics
    async getExpirationStats(req, res) {
        try {
            const now = new Date();
            
            // Group by expiration timeframe
            const expirationGroups = await Certificate.aggregate([
                { $match: { 'validity.notAfter': { $gt: now } } },
                {
                    $addFields: {
                        daysRemaining: {
                            $divide: [
                                { $subtract: ['$validity.notAfter', now] },
                                1000 * 60 * 60 * 24
                            ]
                        }
                    }
                },
                {
                    $bucket: {
                        groupBy: '$daysRemaining',
                        boundaries: [0, 7, 14, 30, 60, 90, 180, 365, Infinity],
                        default: '365+',
                        output: {
                            count: { $sum: 1 },
                            certificates: { $push: { domain: '$domain', notAfter: '$validity.notAfter' } }
                        }
                    }
                }
            ]);
            
            // Timeline of upcoming expirations
            const timeline = await Certificate.find({
                'validity.notAfter': { $gt: now }
            })
                .select('domain validity.notAfter security.grade')
                .sort({ 'validity.notAfter': 1 })
                .limit(20);
            
            res.json({
                success: true,
                data: {
                    groups: expirationGroups,
                    timeline,
                    summary: {
                        immediate: expirationGroups.find(g => g._id === 0)?.count || 0,
                        thisWeek: expirationGroups.find(g => g._id === 7)?.count || 0,
                        thisMonth: expirationGroups.find(g => g._id === 30)?.count || 0
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Get issue statistics
    async getIssueStats(req, res) {
        try {
            const [byGrade, bySeverity, topIssues] = await Promise.all([
                Certificate.aggregate([
                    { $group: { _id: '$security.grade', count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]),
                Certificate.aggregate([
                    { $unwind: '$security.issues' },
                    { $group: { _id: '$security.issues.severity', count: { $sum: 1 } } }
                ]),
                Certificate.aggregate([
                    { $unwind: '$security.issues' },
                    { $group: { _id: '$security.issues.type', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ])
            ]);
            
            res.json({
                success: true,
                data: {
                    byGrade: Object.fromEntries(byGrade.map(g => [g._id || 'N/A', g.count])),
                    bySeverity: Object.fromEntries(bySeverity.map(s => [s._id, s.count])),
                    topIssues
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    // Get dashboard
    async getDashboard(req, res) {
        try {
            const now = new Date();
            const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            const [
                expiringCritical,
                recentAlerts,
                gradeDistribution,
                recentScans,
                domainStatus
            ] = await Promise.all([
                Certificate.find({
                    'validity.notAfter': { $gt: now, $lte: in7days }
                })
                    .select('domain validity.notAfter security.grade')
                    .sort({ 'validity.notAfter': 1 })
                    .limit(5),
                Alert.find({ status: 'active' })
                    .sort({ createdAt: -1 })
                    .limit(5),
                Certificate.aggregate([
                    { $group: { _id: '$security.grade', count: { $sum: 1 } } }
                ]),
                ScanResult.find({ createdAt: { $gte: last24h } })
                    .sort({ createdAt: -1 })
                    .limit(10),
                Domain.aggregate([
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ])
            ]);
            
            res.json({
                success: true,
                data: {
                    criticalExpirations: expiringCritical,
                    recentAlerts,
                    gradeDistribution: Object.fromEntries(
                        gradeDistribution.map(g => [g._id || 'N/A', g.count])
                    ),
                    recentScans,
                    domainStatus: Object.fromEntries(
                        domainStatus.map(d => [d._id, d.count])
                    ),
                    lastUpdated: now.toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = analyticsController;
