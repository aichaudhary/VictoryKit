const Vault = require('../models/vault.model');
const Secret = require('../models/secret.model');
const AccessLog = require('../models/access-log.model');
const encryptionService = require('./encryption.service');
const { v4: uuidv4 } = require('uuid');

class VaultService {
  constructor() {
    this.maxSecretsPerVault = 1000;
    this.maxVaultsPerUser = 50;
  }

  /**
   * Create a new vault
   */
  async createVault(vaultData, userId) {
    try {
      const { name, description, type = 'personal', organizationId, settings = {} } = vaultData;

      // Check vault limits
      const userVaultCount = await Vault.countDocuments({
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ]
      });

      if (userVaultCount >= this.maxVaultsPerUser) {
        throw new Error(`Maximum vault limit (${this.maxVaultsPerUser}) reached`);
      }

      // Generate vault key
      const vaultKey = await encryptionService.generateVaultKey();
      const encryptedVaultKey = await encryptionService.encryptVaultKey(vaultKey, userId);

      // Create vault
      const vault = new Vault({
        name,
        description,
        type,
        owner: userId,
        organization: organizationId,
        vaultKey: encryptedVaultKey,
        settings: {
          allowSharing: settings.allowSharing !== false,
          requireMfa: settings.requireMfa || false,
          autoLock: settings.autoLock || 30, // minutes
          maxSecrets: settings.maxSecrets || 100,
          ...settings
        },
        isActive: true,
        createdAt: new Date(),
        lastAccessed: new Date()
      });

      await vault.save();

      // Log vault creation
      await this.logVaultAccess(vault._id, userId, 'create', 'success');

      return {
        vault: {
          id: vault._id,
          name: vault.name,
          description: vault.description,
          type: vault.type,
          settings: vault.settings,
          secretCount: 0,
          createdAt: vault.createdAt
        },
        vaultKey: vaultKey // Return decrypted key for immediate use
      };
    } catch (error) {
      console.error('Vault creation error:', error);
      throw error;
    }
  }

  /**
   * Get user's vaults
   */
  async getUserVaults(userId, organizationId = null) {
    try {
      const query = {
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ],
        isActive: true
      };

      if (organizationId) {
        query.organization = organizationId;
      }

      const vaults = await Vault.find(query)
        .populate('owner', 'firstName lastName email')
        .populate('organization', 'name')
        .sort({ lastAccessed: -1 });

      // Get secret counts for each vault
      const vaultIds = vaults.map(v => v._id);
      const secretCounts = await Secret.aggregate([
        { $match: { vault: { $in: vaultIds }, isActive: true } },
        { $group: { _id: '$vault', count: { $sum: 1 } } }
      ]);

      const countMap = new Map(secretCounts.map(item => [item._id.toString(), item.count]));

      return vaults.map(vault => ({
        id: vault._id,
        name: vault.name,
        description: vault.description,
        type: vault.type,
        owner: vault.owner,
        organization: vault.organization,
        settings: vault.settings,
        secretCount: countMap.get(vault._id.toString()) || 0,
        sharedWith: vault.sharedWith,
        lastAccessed: vault.lastAccessed,
        createdAt: vault.createdAt
      }));
    } catch (error) {
      console.error('Get vaults error:', error);
      throw error;
    }
  }

  /**
   * Get vault details
   */
  async getVault(vaultId, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ],
        isActive: true
      }).populate('owner', 'firstName lastName email')
        .populate('organization', 'name');

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      // Check access permissions
      const userAccess = vault.sharedWith.find(s => s.user.toString() === userId);
      if (vault.owner.toString() !== userId && (!userAccess || !userAccess.permissions.read)) {
        throw new Error('Access denied');
      }

      // Update last accessed
      vault.lastAccessed = new Date();
      await vault.save();

      // Get secrets count
      const secretCount = await Secret.countDocuments({ vault: vaultId, isActive: true });

      // Log access
      await this.logVaultAccess(vaultId, userId, 'read', 'success');

      return {
        id: vault._id,
        name: vault.name,
        description: vault.description,
        type: vault.type,
        owner: vault.owner,
        organization: vault.organization,
        settings: vault.settings,
        secretCount,
        sharedWith: vault.sharedWith,
        lastAccessed: vault.lastAccessed,
        createdAt: vault.createdAt
      };
    } catch (error) {
      console.error('Get vault error:', error);
      throw error;
    }
  }

  /**
   * Update vault
   */
  async updateVault(vaultId, updateData, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        owner: userId,
        isActive: true
      });

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      const allowedFields = ['name', 'description', 'settings'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          vault[field] = updateData[field];
        }
      });

      vault.updatedAt = new Date();
      await vault.save();

      // Log update
      await this.logVaultAccess(vaultId, userId, 'update', 'success');

      return {
        id: vault._id,
        name: vault.name,
        description: vault.description,
        settings: vault.settings,
        updatedAt: vault.updatedAt
      };
    } catch (error) {
      console.error('Update vault error:', error);
      throw error;
    }
  }

  /**
   * Delete vault
   */
  async deleteVault(vaultId, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        owner: userId,
        isActive: true
      });

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      // Soft delete vault
      vault.isActive = false;
      vault.deletedAt = new Date();
      await vault.save();

      // Soft delete all secrets in vault
      await Secret.updateMany(
        { vault: vaultId, isActive: true },
        { isActive: false, deletedAt: new Date() }
      );

      // Log deletion
      await this.logVaultAccess(vaultId, userId, 'delete', 'success');

      return { message: 'Vault deleted successfully' };
    } catch (error) {
      console.error('Delete vault error:', error);
      throw error;
    }
  }

  /**
   * Share vault with another user
   */
  async shareVault(vaultId, shareData, userId) {
    try {
      const { userEmail, permissions, message } = shareData;

      const vault = await Vault.findOne({
        _id: vaultId,
        owner: userId,
        isActive: true
      });

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      if (!vault.settings.allowSharing) {
        throw new Error('Vault sharing is disabled');
      }

      // Find user to share with
      const User = require('../models/user.model');
      const targetUser = await User.findOne({ email: userEmail });
      if (!targetUser) {
        throw new Error('User not found');
      }

      // Check if already shared
      const existingShare = vault.sharedWith.find(s => s.user.toString() === targetUser._id.toString());
      if (existingShare) {
        throw new Error('Vault already shared with this user');
      }

      // Add to shared list
      vault.sharedWith.push({
        user: targetUser._id,
        permissions: {
          read: permissions.read !== false,
          write: permissions.write || false,
          share: permissions.share || false,
          delete: permissions.delete || false
        },
        sharedAt: new Date(),
        sharedBy: userId
      });

      await vault.save();

      // Send notification email
      if (message) {
        await this.sendShareNotification(targetUser.email, vault.name, message);
      }

      // Log sharing
      await this.logVaultAccess(vaultId, userId, 'share', 'success', { targetUser: targetUser._id });

      return {
        message: 'Vault shared successfully',
        sharedWith: vault.sharedWith[vault.sharedWith.length - 1]
      };
    } catch (error) {
      console.error('Share vault error:', error);
      throw error;
    }
  }

  /**
   * Revoke vault access
   */
  async revokeVaultAccess(vaultId, targetUserId, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        owner: userId,
        isActive: true
      });

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      // Remove from shared list
      vault.sharedWith = vault.sharedWith.filter(s => s.user.toString() !== targetUserId);
      await vault.save();

      // Log revocation
      await this.logVaultAccess(vaultId, userId, 'revoke', 'success', { targetUser: targetUserId });

      return { message: 'Access revoked successfully' };
    } catch (error) {
      console.error('Revoke access error:', error);
      throw error;
    }
  }

  /**
   * Get vault access permissions for user
   */
  async getVaultPermissions(vaultId, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ],
        isActive: true
      });

      if (!vault) {
        return null;
      }

      if (vault.owner.toString() === userId) {
        return {
          isOwner: true,
          read: true,
          write: true,
          share: true,
          delete: true
        };
      }

      const userAccess = vault.sharedWith.find(s => s.user.toString() === userId);
      return {
        isOwner: false,
        ...userAccess.permissions
      };
    } catch (error) {
      console.error('Get permissions error:', error);
      return null;
    }
  }

  /**
   * Decrypt vault key for user
   */
  async getVaultKey(vaultId, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ],
        isActive: true
      });

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      const decryptedKey = await encryptionService.decryptVaultKey(vault.vaultKey, userId);
      return decryptedKey;
    } catch (error) {
      console.error('Get vault key error:', error);
      throw error;
    }
  }

  /**
   * Rotate vault key (for security)
   */
  async rotateVaultKey(vaultId, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        owner: userId,
        isActive: true
      });

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      // Generate new key
      const newVaultKey = await encryptionService.generateVaultKey();
      const encryptedNewKey = await encryptionService.encryptVaultKey(newVaultKey, userId);

      // Get all secrets in vault
      const secrets = await Secret.find({ vault: vaultId, isActive: true });

      // Re-encrypt all secrets with new key
      for (const secret of secrets) {
        const decryptedData = await encryptionService.decryptSecret(secret.encryptedData, vault.vaultKey);
        secret.encryptedData = await encryptionService.encryptSecret(decryptedData, newVaultKey);
        secret.keyVersion = (secret.keyVersion || 0) + 1;
        secret.updatedAt = new Date();
        await secret.save();
      }

      // Update vault with new key
      vault.vaultKey = encryptedNewKey;
      vault.keyVersion = (vault.keyVersion || 0) + 1;
      vault.updatedAt = new Date();
      await vault.save();

      // Log key rotation
      await this.logVaultAccess(vaultId, userId, 'rotate_key', 'success');

      return {
        message: 'Vault key rotated successfully',
        newKeyVersion: vault.keyVersion,
        secretsUpdated: secrets.length
      };
    } catch (error) {
      console.error('Key rotation error:', error);
      throw error;
    }
  }

  /**
   * Send share notification email
   */
  async sendShareNotification(email, vaultName, message) {
    const html = `
      <h2>Vault Shared With You</h2>
      <p>You have been granted access to the vault: <strong>${vaultName}</strong></p>
      ${message ? `<p>Message: ${message}</p>` : ''}
      <p>Login to PasswordVault to access the shared vault.</p>
    `;

    // Use authentication service to send email
    const authService = require('./authentication.service');
    await authService.sendEmail(email, 'Vault Shared - PasswordVault', html);
  }

  /**
   * Log vault access for audit
   */
  async logVaultAccess(vaultId, userId, action, status, details = {}) {
    try {
      const log = new AccessLog({
        user: userId,
        resource: 'vault',
        resourceId: vaultId,
        action,
        status,
        details,
        timestamp: new Date()
      });

      await log.save();
    } catch (error) {
      console.error('Vault access logging error:', error);
    }
  }

  /**
   * Get vault statistics
   */
  async getVaultStats(vaultId, userId) {
    try {
      const vault = await Vault.findOne({
        _id: vaultId,
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ],
        isActive: true
      });

      if (!vault) {
        throw new Error('Vault not found or access denied');
      }

      const [
        totalSecrets,
        activeSecrets,
        secretTypes,
        recentActivity
      ] = await Promise.all([
        Secret.countDocuments({ vault: vaultId }),
        Secret.countDocuments({ vault: vaultId, isActive: true }),
        Secret.aggregate([
          { $match: { vault: vaultId, isActive: true } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        AccessLog.find({
          resource: 'vault',
          resourceId: vaultId
        })
        .populate('user', 'firstName lastName email')
        .sort({ timestamp: -1 })
        .limit(10)
      ]);

      return {
        vaultId,
        totalSecrets,
        activeSecrets,
        deletedSecrets: totalSecrets - activeSecrets,
        secretTypes: secretTypes.reduce((acc, type) => {
          acc[type._id] = type.count;
          return acc;
        }, {}),
        recentActivity: recentActivity.map(log => ({
          action: log.action,
          status: log.status,
          user: log.user,
          timestamp: log.timestamp,
          details: log.details
        })),
        lastAccessed: vault.lastAccessed,
        createdAt: vault.createdAt
      };
    } catch (error) {
      console.error('Get vault stats error:', error);
      throw error;
    }
  }
}

module.exports = new VaultService();