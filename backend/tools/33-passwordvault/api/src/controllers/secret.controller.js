const secretService = require('../services/secret.service');
const { validationResult } = require('express-validator');

class SecretController {
  /**
   * Create a new secret
   */
  async createSecret(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { vaultId, name, type, data, tags, expiresAt, notes } = req.body;
      const userId = req.user.userId;

      const secret = await secretService.createSecret({
        vaultId,
        name,
        type,
        data,
        tags,
        expiresAt,
        notes,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        message: 'Secret created successfully',
        secret
      });
    } catch (error) {
      console.error('Create secret error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get secrets for a vault
   */
  async getSecrets(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 20, search, type, tags, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const result = await secretService.getSecrets(vaultId, userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        type,
        tags: tags ? tags.split(',') : undefined,
        sortBy,
        sortOrder
      });

      res.json({
        success: true,
        secrets: result.secrets,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get secrets error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get secret by ID
   */
  async getSecret(req, res) {
    try {
      const { secretId } = req.params;
      const userId = req.user.userId;

      const secret = await secretService.getSecret(secretId, userId);

      res.json({
        success: true,
        secret
      });
    } catch (error) {
      console.error('Get secret error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update secret
   */
  async updateSecret(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { secretId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const secret = await secretService.updateSecret(secretId, userId, updates);

      res.json({
        success: true,
        message: 'Secret updated successfully',
        secret
      });
    } catch (error) {
      console.error('Update secret error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete secret
   */
  async deleteSecret(req, res) {
    try {
      const { secretId } = req.params;
      const userId = req.user.userId;

      await secretService.deleteSecret(secretId, userId);

      res.json({
        success: true,
        message: 'Secret deleted successfully'
      });
    } catch (error) {
      console.error('Delete secret error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get secret versions
   */
  async getSecretVersions(req, res) {
    try {
      const { secretId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await secretService.getSecretVersions(secretId, userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        versions: result.versions,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get secret versions error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Restore secret version
   */
  async restoreSecretVersion(req, res) {
    try {
      const { secretId, versionId } = req.params;
      const userId = req.user.userId;

      const secret = await secretService.restoreSecretVersion(secretId, versionId, userId);

      res.json({
        success: true,
        message: 'Secret version restored successfully',
        secret
      });
    } catch (error) {
      console.error('Restore secret version error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bulk create secrets
   */
  async bulkCreateSecrets(req, res) {
    try {
      const { vaultId, secrets } = req.body;
      const userId = req.user.userId;

      const result = await secretService.bulkCreateSecrets(vaultId, secrets, userId);

      res.status(201).json({
        success: true,
        message: result.message,
        created: result.created,
        failed: result.failed
      });
    } catch (error) {
      console.error('Bulk create secrets error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bulk update secrets
   */
  async bulkUpdateSecrets(req, res) {
    try {
      const { vaultId, updates } = req.body;
      const userId = req.user.userId;

      const result = await secretService.bulkUpdateSecrets(vaultId, updates, userId);

      res.json({
        success: true,
        message: result.message,
        updated: result.updated,
        failed: result.failed
      });
    } catch (error) {
      console.error('Bulk update secrets error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Bulk delete secrets
   */
  async bulkDeleteSecrets(req, res) {
    try {
      const { secretIds } = req.body;
      const userId = req.user.userId;

      const result = await secretService.bulkDeleteSecrets(secretIds, userId);

      res.json({
        success: true,
        message: result.message,
        deleted: result.deleted,
        failed: result.failed
      });
    } catch (error) {
      console.error('Bulk delete secrets error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Move secrets to another vault
   */
  async moveSecrets(req, res) {
    try {
      const { secretIds, targetVaultId } = req.body;
      const userId = req.user.userId;

      const result = await secretService.moveSecrets(secretIds, targetVaultId, userId);

      res.json({
        success: true,
        message: result.message,
        moved: result.moved,
        failed: result.failed
      });
    } catch (error) {
      console.error('Move secrets error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Copy secrets to another vault
   */
  async copySecrets(req, res) {
    try {
      const { secretIds, targetVaultId } = req.body;
      const userId = req.user.userId;

      const result = await secretService.copySecrets(secretIds, targetVaultId, userId);

      res.json({
        success: true,
        message: result.message,
        copied: result.copied,
        failed: result.failed
      });
    } catch (error) {
      console.error('Copy secrets error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search secrets across vaults
   */
  async searchSecrets(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const { query, type, tags, vaultId, page = 1, limit = 20 } = req.query;

      const result = await secretService.searchSecrets(userId, organizationId, {
        query,
        type,
        tags: tags ? tags.split(',') : undefined,
        vaultId,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        secrets: result.secrets,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Search secrets error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get secret statistics
   */
  async getSecretStats(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      const stats = await secretService.getSecretStats(vaultId, userId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get secret stats error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get expired secrets
   */
  async getExpiredSecrets(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const { page = 1, limit = 20 } = req.query;

      const result = await secretService.getExpiredSecrets(userId, organizationId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        secrets: result.secrets,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get expired secrets error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get expiring secrets (within next 30 days)
   */
  async getExpiringSecrets(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const { days = 30, page = 1, limit = 20 } = req.query;

      const result = await secretService.getExpiringSecrets(userId, organizationId, {
        days: parseInt(days),
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        secrets: result.secrets,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get expiring secrets error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Export secrets
   */
  async exportSecrets(req, res) {
    try {
      const { vaultId } = req.params;
      const { format = 'json', secretIds } = req.query;
      const userId = req.user.userId;

      const exportData = await secretService.exportSecrets(vaultId, userId, format, secretIds ? secretIds.split(',') : undefined);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="secrets-${vaultId}.csv"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="secrets-${vaultId}.json"`);
      }

      res.send(exportData);
    } catch (error) {
      console.error('Export secrets error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Import secrets
   */
  async importSecrets(req, res) {
    try {
      const { vaultId } = req.params;
      const { data, format = 'json' } = req.body;
      const userId = req.user.userId;

      const result = await secretService.importSecrets(vaultId, userId, data, format);

      res.json({
        success: true,
        message: result.message,
        imported: result.imported,
        failed: result.failed
      });
    } catch (error) {
      console.error('Import secrets error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get secret tags
   */
  async getSecretTags(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;

      const tags = await secretService.getSecretTags(userId, organizationId);

      res.json({
        success: true,
        tags
      });
    } catch (error) {
      console.error('Get secret tags error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get secret activity log
   */
  async getSecretActivity(req, res) {
    try {
      const { secretId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 50, action, startDate, endDate } = req.query;

      const result = await secretService.getSecretActivity(secretId, userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        action,
        startDate,
        endDate
      });

      res.json({
        success: true,
        activities: result.activities,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get secret activity error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Generate password for secret
   */
  async generatePassword(req, res) {
    try {
      const { length = 16, includeUppercase = true, includeLowercase = true, includeNumbers = true, includeSymbols = true } = req.body;

      const password = await secretService.generatePassword({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols
      });

      res.json({
        success: true,
        password
      });
    } catch (error) {
      console.error('Generate password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Analyze password strength
   */
  async analyzePassword(req, res) {
    try {
      const { password } = req.body;

      const analysis = await secretService.analyzePassword(password);

      res.json({
        success: true,
        analysis
      });
    } catch (error) {
      console.error('Analyze password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SecretController();