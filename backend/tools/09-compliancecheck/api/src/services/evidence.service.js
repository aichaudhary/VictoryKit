/**
 * Evidence Service - Compliance Evidence Management
 * Tool 09 - ComplianceCheck
 * 
 * Manages evidence collection, validation, and storage
 * with automated collection from integrated platforms
 */

const axios = require('axios');
const crypto = require('crypto');
const ComplianceEvidence = require('../models/ComplianceEvidence.model');
const ComplianceAssessment = require('../models/ComplianceAssessment.model');
const { logger } = require('../../../../../shared');

class EvidenceService {
  constructor() {
    // API configurations
    this.vantaApiKey = process.env.COMPLIANCECHECK_VANTA_API_KEY;
    this.vantaApiUrl = process.env.COMPLIANCECHECK_VANTA_API_URL || 'https://api.vanta.com/v1';
    this.drataApiKey = process.env.COMPLIANCECHECK_DRATA_API_KEY;
    this.drataApiUrl = process.env.COMPLIANCECHECK_DRATA_API_URL || 'https://api.drata.com/v1';

    // Storage configuration
    this.storageProvider = process.env.COMPLIANCECHECK_EVIDENCE_STORAGE || 's3';
    this.s3Bucket = process.env.COMPLIANCECHECK_S3_BUCKET || 'victorykit-compliance-evidence';
    this.s3Region = process.env.AWS_REGION || 'us-east-1';

    // Evidence retention (days)
    this.defaultRetentionDays = parseInt(process.env.COMPLIANCECHECK_EVIDENCE_RETENTION_DAYS) || 365;

    // AI configuration
    this.aiApiKey = process.env.COMPLIANCECHECK_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    // Evidence categories and types
    this.evidenceTypes = {
      policy: {
        displayName: 'Policy Document',
        acceptedFormats: ['pdf', 'docx', 'doc'],
        defaultRetentionDays: 730,
        requiresApproval: true
      },
      procedure: {
        displayName: 'Procedure Document',
        acceptedFormats: ['pdf', 'docx', 'doc'],
        defaultRetentionDays: 730,
        requiresApproval: true
      },
      configuration: {
        displayName: 'Configuration Evidence',
        acceptedFormats: ['json', 'yaml', 'xml', 'png', 'jpg'],
        defaultRetentionDays: 365,
        requiresApproval: false
      },
      screenshot: {
        displayName: 'Screenshot',
        acceptedFormats: ['png', 'jpg', 'jpeg', 'gif'],
        defaultRetentionDays: 365,
        requiresApproval: false
      },
      log: {
        displayName: 'Audit Log',
        acceptedFormats: ['json', 'csv', 'log', 'txt'],
        defaultRetentionDays: 365,
        requiresApproval: false
      },
      attestation: {
        displayName: 'Attestation',
        acceptedFormats: ['pdf', 'docx'],
        defaultRetentionDays: 365,
        requiresApproval: true
      },
      report: {
        displayName: 'Report',
        acceptedFormats: ['pdf', 'xlsx', 'csv'],
        defaultRetentionDays: 365,
        requiresApproval: false
      },
      certificate: {
        displayName: 'Certificate',
        acceptedFormats: ['pdf', 'png'],
        defaultRetentionDays: 365,
        requiresApproval: true
      }
    };
  }

  /**
   * Upload and create evidence record
   */
  async uploadEvidence(evidenceData, fileBuffer = null) {
    const {
      name,
      description,
      category,
      controlId,
      assessmentId,
      source = {},
      validity = {},
      tags = [],
      metadata = {}
    } = evidenceData;

    try {
      // Validate category
      if (!this.evidenceTypes[category]) {
        return { 
          success: false, 
          error: `Invalid category: ${category}. Valid categories: ${Object.keys(this.evidenceTypes).join(', ')}` 
        };
      }

      // Generate storage location
      const timestamp = Date.now();
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      const fileExtension = evidenceData.fileName?.split('.').pop() || 'pdf';
      const storagePath = `${assessmentId || 'general'}/${controlId || 'unassigned'}/${timestamp}-${randomSuffix}.${fileExtension}`;

      // Calculate hash if file provided
      let fileHash = null;
      let fileSize = null;
      if (fileBuffer) {
        fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        fileSize = fileBuffer.length;
      }

      // Set validity dates
      const effectiveDate = validity.effectiveDate || new Date();
      const expiryDays = validity.expiryDays || this.evidenceTypes[category].defaultRetentionDays;
      const expiryDate = new Date(effectiveDate);
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      // Create evidence record
      const evidence = new ComplianceEvidence({
        name,
        description,
        category,
        fileName: evidenceData.fileName,
        fileSize,
        mimeType: evidenceData.mimeType || 'application/octet-stream',
        storage: {
          provider: this.storageProvider,
          bucket: this.s3Bucket,
          path: storagePath,
          region: this.s3Region
        },
        fileHash,
        source: {
          type: source.type || 'manual',
          provider: source.provider,
          integrationId: source.integrationId
        },
        linkedControls: controlId ? [controlId] : [],
        linkedAssessments: assessmentId ? [assessmentId] : [],
        validity: {
          effectiveDate,
          expiryDate
        },
        status: this.evidenceTypes[category].requiresApproval ? 'pending' : 'valid',
        metadata: {
          ...metadata,
          tags
        }
      });

      // Upload file if provided
      if (fileBuffer) {
        const uploadResult = await this.uploadToStorage(storagePath, fileBuffer, evidenceData.mimeType);
        if (!uploadResult.success) {
          return { success: false, error: 'Failed to upload file to storage' };
        }
        evidence.storage.url = uploadResult.url;
      }

      await evidence.save();

      // Link to assessment if provided
      if (assessmentId && controlId) {
        await this.linkEvidenceToAssessment(evidence.evidenceId, assessmentId, controlId);
      }

      return { 
        success: true, 
        evidence: evidence.toObject(),
        evidenceId: evidence.evidenceId 
      };
    } catch (error) {
      logger.error('Error uploading evidence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get evidence by ID
   */
  async getEvidence(evidenceId) {
    try {
      const evidence = await ComplianceEvidence.findOne({ evidenceId }).lean();
      if (!evidence) {
        return { success: false, error: 'Evidence not found' };
      }

      // Check expiry
      if (evidence.validity.expiryDate && new Date(evidence.validity.expiryDate) < new Date()) {
        evidence.isExpired = true;
      }

      return { success: true, evidence };
    } catch (error) {
      logger.error('Error getting evidence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get download URL for evidence
   */
  async getDownloadUrl(evidenceId) {
    try {
      const evidence = await ComplianceEvidence.findOne({ evidenceId });
      if (!evidence) {
        return { success: false, error: 'Evidence not found' };
      }

      // Generate signed URL (would use AWS SDK in production)
      const url = await this.generateSignedUrl(evidence.storage);

      // Update access log
      evidence.accessLog = evidence.accessLog || [];
      evidence.accessLog.push({
        accessedAt: new Date(),
        action: 'download'
      });
      await evidence.save();

      return { success: true, url, expiresIn: 3600 };
    } catch (error) {
      logger.error('Error generating download URL:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate evidence
   */
  async validateEvidence(evidenceId, validatorId) {
    try {
      const evidence = await ComplianceEvidence.findOne({ evidenceId });
      if (!evidence) {
        return { success: false, error: 'Evidence not found' };
      }

      // Perform validation checks
      const validationResult = {
        isValid: true,
        validationScore: 100,
        issues: []
      };

      // Check expiry
      if (evidence.validity.expiryDate && new Date(evidence.validity.expiryDate) < new Date()) {
        validationResult.isValid = false;
        validationResult.validationScore -= 50;
        validationResult.issues.push({
          severity: 'error',
          code: 'EXPIRED',
          message: 'Evidence has expired'
        });
      }

      // Check file hash if available
      if (evidence.fileHash) {
        const currentHash = await this.getStoredFileHash(evidence.storage);
        if (currentHash && currentHash !== evidence.fileHash) {
          validationResult.isValid = false;
          validationResult.validationScore = 0;
          validationResult.issues.push({
            severity: 'critical',
            code: 'INTEGRITY_VIOLATION',
            message: 'File integrity check failed - file has been modified'
          });
        }
      }

      // AI-powered content analysis if enabled
      if (this.aiApiKey && evidence.category === 'policy') {
        const aiAnalysis = await this.performAIValidation(evidence);
        if (aiAnalysis.issues?.length > 0) {
          validationResult.issues.push(...aiAnalysis.issues);
          validationResult.validationScore -= aiAnalysis.issues.length * 5;
        }
      }

      // Update evidence with validation results
      evidence.validation = {
        validatedBy: validatorId,
        validatedAt: new Date(),
        isValid: validationResult.isValid,
        validationScore: Math.max(0, validationResult.validationScore),
        issues: validationResult.issues
      };
      evidence.status = validationResult.isValid ? 'valid' : 'invalid';

      await evidence.save();

      return { success: true, validation: evidence.validation };
    } catch (error) {
      logger.error('Error validating evidence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform AI-powered validation
   */
  async performAIValidation(evidence) {
    // In production, would analyze document content
    return {
      issues: [],
      summary: 'Document appears to be valid and complete'
    };
  }

  /**
   * Link evidence to assessment control
   */
  async linkEvidenceToAssessment(evidenceId, assessmentId, controlId) {
    try {
      // Update evidence
      await ComplianceEvidence.updateOne(
        { evidenceId },
        {
          $addToSet: {
            linkedAssessments: assessmentId,
            linkedControls: controlId
          }
        }
      );

      // Update assessment control
      await ComplianceAssessment.updateOne(
        { assessmentId, 'controls.controlId': controlId },
        {
          $addToSet: {
            'controls.$.evidence': evidenceId
          }
        }
      );

      return { success: true };
    } catch (error) {
      logger.error('Error linking evidence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Collect evidence from Vanta
   */
  async collectFromVanta(controlIds = []) {
    if (!this.vantaApiKey) {
      return { 
        success: false, 
        error: 'Vanta API key not configured',
        simulated: true,
        evidence: this.generateSimulatedEvidence(controlIds, 'vanta')
      };
    }

    try {
      const response = await axios.get(
        `${this.vantaApiUrl}/evidence`,
        {
          headers: { 'Authorization': `Bearer ${this.vantaApiKey}` },
          params: { controlIds: controlIds.join(',') },
          timeout: 30000
        }
      );

      const collectedEvidence = [];
      for (const item of response.data.evidence || []) {
        const result = await this.uploadEvidence({
          name: item.name,
          description: item.description,
          category: this.mapVantaCategory(item.type),
          controlId: item.controlId,
          source: { type: 'automated', provider: 'vanta', integrationId: item.id },
          validity: { expiryDays: 365 }
        });

        if (result.success) {
          collectedEvidence.push(result.evidence);
        }
      }

      return { success: true, evidence: collectedEvidence };
    } catch (error) {
      logger.error('Error collecting from Vanta:', error);
      return { 
        success: false, 
        error: error.message,
        simulated: true,
        evidence: this.generateSimulatedEvidence(controlIds, 'vanta')
      };
    }
  }

  /**
   * Collect evidence from Drata
   */
  async collectFromDrata(controlIds = []) {
    if (!this.drataApiKey) {
      return { 
        success: false, 
        error: 'Drata API key not configured',
        simulated: true,
        evidence: this.generateSimulatedEvidence(controlIds, 'drata')
      };
    }

    try {
      const response = await axios.get(
        `${this.drataApiUrl}/evidence`,
        {
          headers: { 'Authorization': `Bearer ${this.drataApiKey}` },
          params: { controls: controlIds.join(',') },
          timeout: 30000
        }
      );

      const collectedEvidence = [];
      for (const item of response.data.items || []) {
        const result = await this.uploadEvidence({
          name: item.title,
          description: item.description,
          category: this.mapDrataCategory(item.evidenceType),
          controlId: item.controlExternalId,
          source: { type: 'automated', provider: 'drata', integrationId: item.id }
        });

        if (result.success) {
          collectedEvidence.push(result.evidence);
        }
      }

      return { success: true, evidence: collectedEvidence };
    } catch (error) {
      logger.error('Error collecting from Drata:', error);
      return { 
        success: false, 
        error: error.message,
        simulated: true,
        evidence: this.generateSimulatedEvidence(controlIds, 'drata')
      };
    }
  }

  /**
   * Generate simulated evidence for demo
   */
  generateSimulatedEvidence(controlIds, provider) {
    return controlIds.slice(0, 5).map(controlId => ({
      evidenceId: `EVID-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${provider.toUpperCase()} Auto-Collected Evidence`,
      category: 'configuration',
      controlId,
      source: { type: 'automated', provider },
      status: 'valid',
      collectedAt: new Date(),
      simulated: true
    }));
  }

  /**
   * Map Vanta evidence types to our categories
   */
  mapVantaCategory(vantaType) {
    const mapping = {
      'POLICY': 'policy',
      'SCREENSHOT': 'screenshot',
      'CONFIG': 'configuration',
      'LOG': 'log',
      'CERTIFICATE': 'certificate'
    };
    return mapping[vantaType] || 'other';
  }

  /**
   * Map Drata evidence types to our categories
   */
  mapDrataCategory(drataType) {
    const mapping = {
      'policy': 'policy',
      'procedure': 'procedure',
      'screenshot': 'screenshot',
      'configuration': 'configuration',
      'audit_log': 'log'
    };
    return mapping[drataType] || 'other';
  }

  /**
   * List evidence with filters
   */
  async listEvidence(options = {}) {
    const { 
      assessmentId, 
      controlId, 
      category, 
      status,
      includeExpired = false,
      page = 1, 
      limit = 20 
    } = options;

    try {
      const query = {};
      if (assessmentId) query.linkedAssessments = assessmentId;
      if (controlId) query.linkedControls = controlId;
      if (category) query.category = category;
      if (status) query.status = status;
      if (!includeExpired) {
        query.$or = [
          { 'validity.expiryDate': { $gt: new Date() } },
          { 'validity.expiryDate': null }
        ];
      }

      const total = await ComplianceEvidence.countDocuments(query);
      const evidence = await ComplianceEvidence.find(query)
        .select('evidenceId name category status source.provider validity.expiryDate linkedControls createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return {
        success: true,
        evidence,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error listing evidence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get expiring evidence
   */
  async getExpiringEvidence(daysThreshold = 30) {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const evidence = await ComplianceEvidence.find({
        status: 'valid',
        'validity.expiryDate': { $lte: thresholdDate, $gte: new Date() }
      })
        .select('evidenceId name category validity.expiryDate linkedControls')
        .sort({ 'validity.expiryDate': 1 })
        .lean();

      return { 
        success: true, 
        evidence,
        count: evidence.length,
        thresholdDate
      };
    } catch (error) {
      logger.error('Error getting expiring evidence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete evidence
   */
  async deleteEvidence(evidenceId) {
    try {
      const evidence = await ComplianceEvidence.findOne({ evidenceId });
      if (!evidence) {
        return { success: false, error: 'Evidence not found' };
      }

      // Delete from storage
      if (evidence.storage?.path) {
        await this.deleteFromStorage(evidence.storage);
      }

      // Remove from linked assessments
      await ComplianceAssessment.updateMany(
        { 'controls.evidence': evidenceId },
        { $pull: { 'controls.$.evidence': evidenceId } }
      );

      // Delete record
      await ComplianceEvidence.deleteOne({ evidenceId });

      return { success: true, message: 'Evidence deleted successfully' };
    } catch (error) {
      logger.error('Error deleting evidence:', error);
      return { success: false, error: error.message };
    }
  }

  // Storage helper methods (would use AWS SDK in production)
  async uploadToStorage(path, buffer, mimeType) {
    // Simulated S3 upload
    logger.info(`Uploading to ${this.storageProvider}:${this.s3Bucket}/${path}`);
    return { 
      success: true, 
      url: `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${path}`
    };
  }

  async generateSignedUrl(storage) {
    // Simulated signed URL generation
    return `https://${storage.bucket}.s3.${storage.region}.amazonaws.com/${storage.path}?signature=demo`;
  }

  async getStoredFileHash(storage) {
    // Would fetch and hash file from storage
    return null;
  }

  async deleteFromStorage(storage) {
    logger.info(`Deleting from ${storage.provider}:${storage.bucket}/${storage.path}`);
    return { success: true };
  }
}

module.exports = new EvidenceService();
