const vaultService = require('../services/vault.service');
const { validationResult } = require('express-validator');

class VaultController {
  /**
   * Create a new vault
   */
  async createVault(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, description, type, settings } = req.body;
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;

      const vault = await vaultService.createVault({
        name,
        description,
        type,
        settings,
        owner: userId,
        organization: organizationId
      });

      res.status(201).json({
        success: true,
        message: 'Vault created successfully',
        vault
      });
    } catch (error) {
      console.error('Create vault error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all vaults for user
   */
  async getVaults(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const { page = 1, limit = 20, search, type } = req.query;

      const result = await vaultService.getVaults(userId, organizationId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        type
      });

      res.json({
        success: true,
        vaults: result.vaults,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get vaults error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get vault by ID
   */
  async getVault(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      const vault = await vaultService.getVault(vaultId, userId);

      res.json({
        success: true,
        vault
      });
    } catch (error) {
      console.error('Get vault error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update vault
   */
  async updateVault(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { vaultId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const vault = await vaultService.updateVault(vaultId, userId, updates);

      res.json({
        success: true,
        message: 'Vault updated successfully',
        vault
      });
    } catch (error) {
      console.error('Update vault error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete vault
   */
  async deleteVault(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      await vaultService.deleteVault(vaultId, userId);

      res.json({
        success: true,
        message: 'Vault deleted successfully'
      });
    } catch (error) {
      console.error('Delete vault error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Share vault with user
   */
  async shareVault(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { vaultId } = req.params;
      const { userId: shareUserId, permissions, message } = req.body;
      const ownerId = req.user.userId;

      const result = await vaultService.shareVault(vaultId, ownerId, shareUserId, permissions, message);

      res.json({
        success: true,
        message: result.message,
        share: result.share
      });
    } catch (error) {
      console.error('Share vault error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get vault shares
   */
  async getVaultShares(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      const shares = await vaultService.getVaultShares(vaultId, userId);

      res.json({
        success: true,
        shares
      });
    } catch (error) {
      console.error('Get vault shares error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update vault share permissions
   */
  async updateVaultShare(req, res) {
    try {
      const { vaultId, shareId } = req.params;
      const { permissions } = req.body;
      const userId = req.user.userId;

      const share = await vaultService.updateVaultShare(vaultId, shareId, userId, permissions);

      res.json({
        success: true,
        message: 'Share permissions updated successfully',
        share
      });
    } catch (error) {
      console.error('Update vault share error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remove vault share
   */
  async removeVaultShare(req, res) {
    try {
      const { vaultId, shareId } = req.params;
      const userId = req.user.userId;

      await vaultService.removeVaultShare(vaultId, shareId, userId);

      res.json({
        success: true,
        message: 'Share removed successfully'
      });
    } catch (error) {
      console.error('Remove vault share error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Accept vault share invitation
   */
  async acceptVaultShare(req, res) {
    try {
      const { shareId } = req.params;
      const userId = req.user.userId;

      const result = await vaultService.acceptVaultShare(shareId, userId);

      res.json({
        success: true,
        message: result.message,
        vault: result.vault
      });
    } catch (error) {
      console.error('Accept vault share error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Decline vault share invitation
   */
  async declineVaultShare(req, res) {
    try {
      const { shareId } = req.params;
      const userId = req.user.userId;

      await vaultService.declineVaultShare(shareId, userId);

      res.json({
        success: true,
        message: 'Share invitation declined'
      });
    } catch (error) {
      console.error('Decline vault share error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get pending vault shares for user
   */
  async getPendingShares(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await vaultService.getPendingShares(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        shares: result.shares,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get pending shares error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Rotate vault encryption key
   */
  async rotateVaultKey(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      const result = await vaultService.rotateVaultKey(vaultId, userId);

      res.json({
        success: true,
        message: result.message,
        rotatedAt: result.rotatedAt
      });
    } catch (error) {
      console.error('Rotate vault key error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get vault statistics
   */
  async getVaultStats(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      const stats = await vaultService.getVaultStats(vaultId, userId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get vault stats error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Export vault data
   */
  async exportVault(req, res) {
    try {
      const { vaultId } = req.params;
      const { format = 'json' } = req.query;
      const userId = req.user.userId;

      const exportData = await vaultService.exportVault(vaultId, userId, format);

      // Set appropriate headers based on format
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="vault-${vaultId}.csv"`);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="vault-${vaultId}.json"`);
      }

      res.send(exportData);
    } catch (error) {
      console.error('Export vault error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Import vault data
   */
  async importVault(req, res) {
    try {
      const { vaultId } = req.params;
      const { data, format = 'json' } = req.body;
      const userId = req.user.userId;

      const result = await vaultService.importVault(vaultId, userId, data, format);

      res.json({
        success: true,
        message: result.message,
        imported: result.imported
      });
    } catch (error) {
      console.error('Import vault error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Archive vault
   */
  async archiveVault(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      await vaultService.archiveVault(vaultId, userId);

      res.json({
        success: true,
        message: 'Vault archived successfully'
      });
    } catch (error) {
      console.error('Archive vault error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Restore archived vault
   */
  async restoreVault(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;

      await vaultService.restoreVault(vaultId, userId);

      res.json({
        success: true,
        message: 'Vault restored successfully'
      });
    } catch (error) {
      console.error('Restore vault error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get archived vaults
   */
  async getArchivedVaults(req, res) {
    try {
      const userId = req.user.userId;
      const organizationId = req.user.organizationId;
      const { page = 1, limit = 20 } = req.query;

      const result = await vaultService.getArchivedVaults(userId, organizationId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        vaults: result.vaults,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get archived vaults error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Transfer vault ownership
   */
  async transferOwnership(req, res) {
    try {
      const { vaultId } = req.params;
      const { newOwnerId } = req.body;
      const currentOwnerId = req.user.userId;

      const result = await vaultService.transferOwnership(vaultId, currentOwnerId, newOwnerId);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Transfer ownership error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get vault activity log
   */
  async getVaultActivity(req, res) {
    try {
      const { vaultId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 50, action, startDate, endDate } = req.query;

      const result = await vaultService.getVaultActivity(vaultId, userId, {
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
      console.error('Get vault activity error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new VaultController();