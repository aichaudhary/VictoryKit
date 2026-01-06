const express = require('express');
const router = express.Router();
const controller = require('../controllers');

// System
router.get('/status', controller.getStatus);

// Data Subjects
router.post('/data-subjects', controller.createDataSubject);
router.get('/data-subjects', controller.getDataSubjects);
router.get('/data-subjects/:id', controller.getDataSubjectById);

// Consent Management (Article 7)
router.post('/consents', controller.createConsent);
router.get('/consents', controller.getConsents);
router.post('/consents/:id/withdraw', controller.withdrawConsent);

// Processing Activities (Article 30)
router.post('/processing-activities', controller.createProcessingActivity);
router.get('/processing-activities', controller.getProcessingActivities);

// DSARs (Article 15-22)
router.post('/dsars', controller.createDSAR);
router.get('/dsars', controller.getDSARs);
router.post('/dsars/:id/complete', controller.completeDSAR);

// Data Breaches (Article 33-34)
router.post('/breaches', controller.createDataBreach);
router.get('/breaches', controller.getDataBreaches);
router.post('/breaches/:id/notify-authority', controller.notifySupervisoryAuthority);

// DPIAs (Article 35)
router.post('/dpias', controller.createDPIA);
router.get('/dpias', controller.getDPIAs);

// Legal Basis (Article 6)
router.post('/legal-bases', controller.createLegalBasis);

// Data Transfers (Article 44-50)
router.post('/transfers', controller.createDataTransfer);

// Processors (Article 28)
router.post('/processors', controller.createProcessor);
router.get('/processors', controller.getProcessors);

// Retention Schedules
router.post('/retention-schedules', controller.createRetentionSchedule);

// DPOs (Article 37-39)
router.post('/dpos', controller.createDPO);
router.get('/dpos', controller.getDPOs);

// Audit Logs
router.post('/audit-logs', controller.createAuditLog);
router.get('/audit-logs', controller.getAuditLogs);

// ML Engine
router.post('/analyze', controller.analyze);
router.post('/scan', controller.scan);
router.get('/reports', controller.getReports);
router.get('/reports/:id', controller.getReportById);
router.get('/config', controller.getConfig);
router.put('/config', controller.updateConfig);

module.exports = router;
