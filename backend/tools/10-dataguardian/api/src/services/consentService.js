/**
 * Consent Management Service for DataGuardian
 * Handles consent collection, storage, withdrawal, and verification
 * Integrates with OneTrust, TrustArc, and Privacera consent management platforms
 */
const axios = require('axios');
const ConsentRecord = require('../models/ConsentRecord');
const { logger } = require('../../../../../shared');

class ConsentService {
  constructor() {
    // OneTrust Consent configuration
    this.oneTrustConfig = {
      clientId: process.env.DATAGUARDIAN_ONETRUST_CLIENT_ID,
      clientSecret: process.env.DATAGUARDIAN_ONETRUST_CLIENT_SECRET,
      apiUrl: process.env.DATAGUARDIAN_ONETRUST_API_URL || 'https://api.onetrust.com/api/consentmanager/v2',
      tenantId: process.env.DATAGUARDIAN_ONETRUST_TENANT_ID
    };

    // TrustArc configuration
    this.trustArcConfig = {
      apiKey: process.env.DATAGUARDIAN_TRUSTARC_API_KEY,
      apiUrl: process.env.DATAGUARDIAN_TRUSTARC_API_URL || 'https://api.trustarc.com/v2'
    };

    // Consent management settings
    this.consentConfig = {
      maxAge: parseInt(process.env.DATAGUARDIAN_CONSENT_MAX_AGE_DAYS) || 365,
      renewalDays: parseInt(process.env.DATAGUARDIAN_CONSENT_RENEWAL_DAYS) || 30,
      doubleOptIn: process.env.DATAGUARDIAN_CONSENT_DOUBLE_OPT_IN === 'true',
      granular: process.env.DATAGUARDIAN_CONSENT_GRANULAR === 'true'
    };

    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Check if real API integrations are configured
   */
  isConfigured(provider = 'onetrust') {
    switch (provider) {
      case 'onetrust':
        return !!(this.oneTrustConfig.clientId && this.oneTrustConfig.clientSecret);
      case 'trustarc':
        return !!this.trustArcConfig.apiKey;
      default:
        return false;
    }
  }

  /**
   * Get OneTrust OAuth token
   */
  async getOneTrustToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.isConfigured('onetrust')) {
      return null;
    }

    try {
      const response = await axios.post('https://api.onetrust.com/oauth/token', null, {
        params: {
          grant_type: 'client_credentials',
          client_id: this.oneTrustConfig.clientId,
          client_secret: this.oneTrustConfig.clientSecret
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      return this.accessToken;
    } catch (error) {
      logger.error('OneTrust OAuth error:', error.message);
      return null;
    }
  }

  /**
   * Record new consent
   */
  async recordConsent(consentData) {
    try {
      // If OneTrust is configured, sync to OneTrust
      if (this.isConfigured('onetrust')) {
        const externalResult = await this.syncToOneTrust(consentData);
        if (externalResult) {
          consentData.externalId = externalResult.id;
          consentData.externalSystem = 'onetrust';
        }
      }

      // Create local consent record
      const consent = new ConsentRecord({
        userId: consentData.userId,
        dataSubject: {
          identifier: consentData.identifier,
          identifierType: consentData.identifierType || 'email',
          attributes: consentData.attributes
        },
        purpose: {
          code: consentData.purposeCode,
          name: consentData.purposeName,
          description: consentData.purposeDescription,
          legalBasis: consentData.legalBasis || 'consent',
          dataCategories: consentData.dataCategories || [],
          processingActivities: consentData.processingActivities || [],
          thirdPartySharing: consentData.thirdPartySharing || false
        },
        consent: {
          status: consentData.status || 'granted',
          method: consentData.method || 'explicit',
          timestamp: new Date(),
          ipAddress: consentData.ipAddress,
          userAgent: consentData.userAgent
        },
        regulations: consentData.regulations || ['gdpr'],
        source: {
          type: consentData.sourceType || 'web-form',
          url: consentData.sourceUrl,
          formId: consentData.formId,
          campaignId: consentData.campaignId
        },
        timeline: {
          collectedAt: new Date(),
          expiresAt: this.calculateExpiry(consentData.duration)
        },
        proof: {
          formSnapshot: consentData.formSnapshot,
          policyVersion: consentData.policyVersion,
          declaration: consentData.declaration
        }
      });

      // Handle double opt-in if required
      if (this.consentConfig.doubleOptIn && consentData.method === 'explicit') {
        consent.consent.status = 'pending';
        consent.consent.verificationRequired = true;
        consent.consent.verificationToken = this.generateVerificationToken();
      }

      await consent.save();

      logger.info(`Consent recorded: ${consent.consentId} for ${consentData.identifier}`);

      return {
        consentId: consent.consentId,
        status: consent.consent.status,
        verificationRequired: consent.consent.verificationRequired || false,
        expiresAt: consent.timeline.expiresAt,
        source: this.isConfigured('onetrust') ? 'onetrust' : 'simulation'
      };
    } catch (error) {
      logger.error('Record consent error:', error.message);
      throw error;
    }
  }

  /**
   * Verify consent (double opt-in)
   */
  async verifyConsent(consentId, verificationToken) {
    try {
      const consent = await ConsentRecord.findOne({ 
        $or: [{ consentId }, { _id: consentId }]
      });

      if (!consent) {
        throw new Error('Consent record not found');
      }

      if (consent.consent.status !== 'pending') {
        return { success: false, message: 'Consent is not pending verification' };
      }

      if (consent.consent.verificationToken !== verificationToken) {
        return { success: false, message: 'Invalid verification token' };
      }

      consent.consent.status = 'granted';
      consent.consent.verifiedAt = new Date();
      consent.consent.verificationToken = undefined;
      consent.consent.verificationRequired = false;

      consent.history.push({
        action: 'verified',
        timestamp: new Date(),
        details: { method: 'token' }
      });

      await consent.save();

      logger.info(`Consent verified: ${consent.consentId}`);

      return {
        success: true,
        consentId: consent.consentId,
        status: consent.consent.status
      };
    } catch (error) {
      logger.error('Verify consent error:', error.message);
      throw error;
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(consentIdOrIdentifier, options = {}) {
    try {
      let consent;

      // Find by consentId or identifier
      if (options.identifier) {
        consent = await ConsentRecord.findOne({
          'dataSubject.identifier': consentIdOrIdentifier,
          'purpose.code': options.purposeCode,
          'consent.status': 'granted'
        });
      } else {
        consent = await ConsentRecord.findOne({ 
          $or: [{ consentId: consentIdOrIdentifier }, { _id: consentIdOrIdentifier }]
        });
      }

      if (!consent) {
        throw new Error('Consent record not found');
      }

      // Update consent status
      consent.consent.status = 'withdrawn';
      consent.timeline.withdrawnAt = new Date();

      consent.history.push({
        action: 'withdrawn',
        timestamp: new Date(),
        details: {
          reason: options.reason,
          method: options.method || 'user-request'
        }
      });

      await consent.save();

      // Sync withdrawal to OneTrust if configured
      if (this.isConfigured('onetrust') && consent.externalId) {
        await this.withdrawOneTrustConsent(consent.externalId);
      }

      logger.info(`Consent withdrawn: ${consent.consentId}`);

      return {
        success: true,
        consentId: consent.consentId,
        status: consent.consent.status,
        withdrawnAt: consent.timeline.withdrawnAt
      };
    } catch (error) {
      logger.error('Withdraw consent error:', error.message);
      throw error;
    }
  }

  /**
   * Check consent status
   */
  async checkConsent(identifier, purposeCode, options = {}) {
    try {
      // Use model's static method
      const consent = await ConsentRecord.checkConsent(identifier, purposeCode);

      if (!consent) {
        return {
          hasConsent: false,
          status: 'not_found',
          message: 'No consent record found for this purpose'
        };
      }

      // Check expiry
      if (consent.timeline.expiresAt && consent.timeline.expiresAt < new Date()) {
        return {
          hasConsent: false,
          status: 'expired',
          expiredAt: consent.timeline.expiresAt,
          consentId: consent.consentId
        };
      }

      return {
        hasConsent: consent.consent.status === 'granted',
        status: consent.consent.status,
        consentId: consent.consentId,
        grantedAt: consent.timeline.collectedAt,
        expiresAt: consent.timeline.expiresAt,
        purposeCode: consent.purpose.code,
        purposeName: consent.purpose.name,
        legalBasis: consent.purpose.legalBasis
      };
    } catch (error) {
      logger.error('Check consent error:', error.message);
      throw error;
    }
  }

  /**
   * Get all consents for a data subject
   */
  async getDataSubjectConsents(identifier, options = {}) {
    try {
      const query = { 'dataSubject.identifier': identifier };

      if (options.status) {
        query['consent.status'] = options.status;
      }

      if (options.regulation) {
        query.regulations = options.regulation;
      }

      const consents = await ConsentRecord.find(query)
        .sort({ 'timeline.collectedAt': -1 })
        .limit(options.limit || 50);

      return {
        identifier,
        totalConsents: consents.length,
        consents: consents.map(c => ({
          consentId: c.consentId,
          purpose: {
            code: c.purpose.code,
            name: c.purpose.name
          },
          status: c.consent.status,
          grantedAt: c.timeline.collectedAt,
          expiresAt: c.timeline.expiresAt,
          withdrawnAt: c.timeline.withdrawnAt
        }))
      };
    } catch (error) {
      logger.error('Get data subject consents error:', error.message);
      throw error;
    }
  }

  /**
   * Get consent preferences (preference center data)
   */
  async getConsentPreferences(identifier) {
    try {
      const consents = await ConsentRecord.find({
        'dataSubject.identifier': identifier,
        'consent.status': { $in: ['granted', 'pending'] }
      });

      // Group by purpose category
      const preferences = {};
      consents.forEach(consent => {
        const category = consent.purpose.category || 'general';
        if (!preferences[category]) {
          preferences[category] = [];
        }
        preferences[category].push({
          purposeCode: consent.purpose.code,
          purposeName: consent.purpose.name,
          status: consent.consent.status,
          canWithdraw: consent.purpose.legalBasis === 'consent',
          consentId: consent.consentId
        });
      });

      return {
        identifier,
        preferences,
        lastUpdated: consents.length > 0 
          ? Math.max(...consents.map(c => c.timeline.collectedAt.getTime()))
          : null
      };
    } catch (error) {
      logger.error('Get consent preferences error:', error.message);
      throw error;
    }
  }

  /**
   * Update preferences (bulk consent update)
   */
  async updatePreferences(identifier, preferences) {
    try {
      const results = [];

      for (const pref of preferences) {
        if (pref.action === 'grant') {
          const result = await this.recordConsent({
            identifier,
            purposeCode: pref.purposeCode,
            purposeName: pref.purposeName,
            status: 'granted',
            method: 'preference-center'
          });
          results.push({ ...result, action: 'grant' });
        } else if (pref.action === 'withdraw') {
          const result = await this.withdrawConsent(identifier, {
            identifier: true,
            purposeCode: pref.purposeCode,
            method: 'preference-center'
          });
          results.push({ ...result, action: 'withdraw' });
        }
      }

      return {
        success: true,
        updated: results.length,
        results
      };
    } catch (error) {
      logger.error('Update preferences error:', error.message);
      throw error;
    }
  }

  /**
   * Get consent dashboard statistics
   */
  async getConsentDashboard(userId) {
    try {
      const stats = await ConsentRecord.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            granted: { $sum: { $cond: [{ $eq: ['$consent.status', 'granted'] }, 1, 0] } },
            withdrawn: { $sum: { $cond: [{ $eq: ['$consent.status', 'withdrawn'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$consent.status', 'pending'] }, 1, 0] } },
            expired: { $sum: { $cond: [{ $eq: ['$consent.status', 'expired'] }, 1, 0] } }
          }
        }
      ]);

      const byPurpose = await ConsentRecord.aggregate([
        { $match: { userId, 'consent.status': 'granted' } },
        { $group: { _id: '$purpose.code', name: { $first: '$purpose.name' }, count: { $sum: 1 } } }
      ]);

      const byRegulation = await ConsentRecord.aggregate([
        { $match: { userId } },
        { $unwind: '$regulations' },
        { $group: { _id: '$regulations', count: { $sum: 1 } } }
      ]);

      const recentActivity = await ConsentRecord.find({ userId })
        .sort({ 'timeline.collectedAt': -1 })
        .limit(10)
        .select('consentId purpose.code purpose.name consent.status timeline.collectedAt');

      // Calculate opt-in rate
      const total = stats[0]?.total || 0;
      const granted = stats[0]?.granted || 0;
      const optInRate = total > 0 ? Math.round((granted / total) * 100) : 0;

      return {
        summary: stats[0] || { total: 0, granted: 0, withdrawn: 0, pending: 0, expired: 0 },
        optInRate,
        byPurpose: byPurpose.map(p => ({ code: p._id, name: p.name, count: p.count })),
        byRegulation: byRegulation.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
        recentActivity: recentActivity.map(r => ({
          consentId: r.consentId,
          purpose: r.purpose.code,
          purposeName: r.purpose.name,
          status: r.consent.status,
          date: r.timeline.collectedAt
        })),
        expiringConsents: await this.getExpiringConsents(userId, 30)
      };
    } catch (error) {
      logger.error('Consent dashboard error:', error.message);
      throw error;
    }
  }

  /**
   * Get consents expiring within days
   */
  async getExpiringConsents(userId, days = 30) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const consents = await ConsentRecord.find({
      userId,
      'consent.status': 'granted',
      'timeline.expiresAt': { $lte: expiryDate, $gt: new Date() }
    }).select('consentId dataSubject.identifier purpose.code purpose.name timeline.expiresAt');

    return consents.map(c => ({
      consentId: c.consentId,
      identifier: c.dataSubject.identifier,
      purpose: c.purpose.code,
      purposeName: c.purpose.name,
      expiresAt: c.timeline.expiresAt
    }));
  }

  // ==================== EXTERNAL API METHODS ====================

  /**
   * Sync consent to OneTrust
   */
  async syncToOneTrust(consentData) {
    try {
      const token = await this.getOneTrustToken();
      if (!token) return null;

      const response = await axios.post(
        `${this.oneTrustConfig.apiUrl}/consents`,
        {
          identifier: consentData.identifier,
          identifierType: consentData.identifierType || 'email',
          purposes: [{
            id: consentData.purposeCode,
            version: 1,
            transactionType: consentData.status === 'granted' ? 'OPT_IN' : 'OPT_OUT'
          }],
          collectionPointId: consentData.collectionPointId,
          signedDate: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`OneTrust consent synced: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('OneTrust sync error:', error.message);
      return null;
    }
  }

  /**
   * Withdraw consent in OneTrust
   */
  async withdrawOneTrustConsent(externalId) {
    try {
      const token = await this.getOneTrustToken();
      if (!token) return null;

      await axios.put(
        `${this.oneTrustConfig.apiUrl}/consents/${externalId}/withdraw`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`OneTrust consent withdrawn: ${externalId}`);
      return true;
    } catch (error) {
      logger.error('OneTrust withdraw error:', error.message);
      return null;
    }
  }

  // ==================== HELPER METHODS ====================

  calculateExpiry(duration) {
    const days = duration || this.consentConfig.maxAge;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }

  generateVerificationToken() {
    return `VRF-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
  }
}

module.exports = new ConsentService();
