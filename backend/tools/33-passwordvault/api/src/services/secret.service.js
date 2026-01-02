const Secret = require('../models/secret.model');
const Vault = require('../models/vault.model');
const AccessLog = require('../models/access-log.model');
const encryptionService = require('./encryption.service');
const passwordAnalysisService = require('./password-analysis.service');
const { v4: uuidv4 } = require('uuid');

class SecretService {
  constructor() {
    this.maxSecretVersions = 50;
    this.maxSecretSize = 10 * 1024 * 1024; // 10MB
  }

  /**
   * Create a new secret
   */
  async createSecret(secretData, vaultId, userId) {
    try {
      const { name, type, data, tags = [], notes, expiresAt, customFields = {} } = secretData;

      // Validate vault access
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

      // Check write permissions
      const permissions = await this.getVaultPermissions(vaultId, userId);
      if (!permissions.write) {
        throw new Error('Write access denied');
      }

      // Check secret limits
      const secretCount = await Secret.countDocuments({ vault: vaultId, isActive: true });
      if (secretCount >= vault.settings.maxSecrets) {
        throw new Error(`Maximum secrets per vault (${vault.settings.maxSecrets}) reached`);
      }

      // Validate secret data size
      const dataSize = JSON.stringify(data).length;
      if (dataSize > this.maxSecretSize) {
        throw new Error(`Secret data too large (max ${this.maxSecretSize} bytes)`);
      }

      // Get vault key and encrypt data
      const vaultKey = await this.getVaultKey(vaultId, userId);
      const encryptedData = await encryptionService.encryptSecret(data, vaultKey);

      // Analyze password if it's a password type
      let analysis = null;
      if (type === 'password' && data.password) {
        analysis = await passwordAnalysisService.analyzePasswordStrength(data.password, {
          purpose: data.purpose || 'general',
          service: name
        });
      }

      // Create secret
      const secret = new Secret({
        name,
        type,
        vault: vaultId,
        encryptedData,
        tags,
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        customFields,
        analysis,
        version: 1,
        versions: [{
          version: 1,
          encryptedData,
          createdAt: new Date(),
          createdBy: userId,
          changeReason: 'Initial creation'
        }],
        createdBy: userId,
        lastModifiedBy: userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await secret.save();

      // Log creation
      await this.logSecretAccess(secret._id, userId, 'create', 'success');

      return {
        id: secret._id,
        name: secret.name,
        type: secret.type,
        tags: secret.tags,
        notes: secret.notes,
        expiresAt: secret.expiresAt,
        customFields: secret.customFields,
        analysis: secret.analysis,
        version: secret.version,
        createdAt: secret.createdAt,
        updatedAt: secret.updatedAt
      };
    } catch (error) {
      console.error('Create secret error:', error);
      throw error;
    }
  }

  /**
   * Get secrets in vault
   */
  async getSecrets(vaultId, userId, filters = {}) {
    try {
      // Validate vault access
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

      // Check read permissions
      const permissions = await this.getVaultPermissions(vaultId, userId);
      if (!permissions.read) {
        throw new Error('Read access denied');
      }

      // Build query
      const query = {
        vault: vaultId,
        isActive: true
      };

      if (filters.type) query.type = filters.type;
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      if (filters.search) {
        query.$or = [
          { name: new RegExp(filters.search, 'i') },
          { notes: new RegExp(filters.search, 'i') },
          { tags: new RegExp(filters.search, 'i') }
        ];
      }

      const secrets = await Secret.find(query)
        .sort({ updatedAt: -1 })
        .select('-encryptedData -versions.encryptedData');

      // Log access
      await this.logSecretAccess(null, userId, 'list', 'success', { vaultId, filters });

      return secrets.map(secret => ({
        id: secret._id,
        name: secret.name,
        type: secret.type,
        tags: secret.tags,
        notes: secret.notes,
        expiresAt: secret.expiresAt,
        customFields: secret.customFields,
        analysis: secret.analysis,
        version: secret.version,
        lastAccessed: secret.lastAccessed,
        createdAt: secret.createdAt,
        updatedAt: secret.updatedAt
      }));
    } catch (error) {
      console.error('Get secrets error:', error);
      throw error;
    }
  }

  /**
   * Get secret details (with decrypted data)
   */
  async getSecret(secretId, userId, includeData = true) {
    try {
      const secret = await Secret.findOne({
        _id: secretId,
        isActive: true
      }).populate('vault');

      if (!secret) {
        throw new Error('Secret not found');
      }

      // Validate vault access
      const permissions = await this.getVaultPermissions(secret.vault._id, userId);
      if (!permissions.read) {
        throw new Error('Read access denied');
      }

      let decryptedData = null;
      if (includeData) {
        const vaultKey = await this.getVaultKey(secret.vault._id, userId);
        decryptedData = await encryptionService.decryptSecret(secret.encryptedData, vaultKey);
      }

      // Update last accessed
      secret.lastAccessed = new Date();
      await secret.save();

      // Log access
      await this.logSecretAccess(secretId, userId, 'read', 'success');

      return {
        id: secret._id,
        name: secret.name,
        type: secret.type,
        data: decryptedData,
        tags: secret.tags,
        notes: secret.notes,
        expiresAt: secret.expiresAt,
        customFields: secret.customFields,
        analysis: secret.analysis,
        version: secret.version,
        versions: secret.versions.map(v => ({
          version: v.version,
          createdAt: v.createdAt,
          createdBy: v.createdBy,
          changeReason: v.changeReason
        })),
        vault: {
          id: secret.vault._id,
          name: secret.vault.name
        },
        createdBy: secret.createdBy,
        lastModifiedBy: secret.lastModifiedBy,
        lastAccessed: secret.lastAccessed,
        createdAt: secret.createdAt,
        updatedAt: secret.updatedAt
      };
    } catch (error) {
      console.error('Get secret error:', error);
      throw error;
    }
  }

  /**
   * Update secret
   */
  async updateSecret(secretId, updateData, userId, changeReason = '') {
    try {
      const secret = await Secret.findOne({
        _id: secretId,
        isActive: true
      }).populate('vault');

      if (!secret) {
        throw new Error('Secret not found');
      }

      // Check write permissions
      const permissions = await this.getVaultPermissions(secret.vault._id, userId);
      if (!permissions.write) {
        throw new Error('Write access denied');
      }

      // Create new version
      const vaultKey = await this.getVaultKey(secret.vault._id, userId);
      let encryptedData = secret.encryptedData;
      let newAnalysis = secret.analysis;

      // Encrypt new data if provided
      if (updateData.data) {
        encryptedData = await encryptionService.encryptSecret(updateData.data, vaultKey);

        // Re-analyze password if it's a password type
        if (secret.type === 'password' && updateData.data.password) {
          newAnalysis = await passwordAnalysisService.analyzePasswordStrength(
            updateData.data.password,
            { purpose: updateData.data.purpose || secret.name }
          );
        }
      }

      // Add to versions history
      const newVersion = {
        version: secret.version + 1,
        encryptedData: secret.encryptedData, // Keep old encrypted data
        createdAt: new Date(),
        createdBy: userId,
        changeReason: changeReason || 'Updated'
      };

      secret.versions.push(newVersion);

      // Trim versions if too many
      if (secret.versions.length > this.maxSecretVersions) {
        secret.versions = secret.versions.slice(-this.maxSecretVersions);
      }

      // Update secret fields
      const allowedFields = ['name', 'type', 'tags', 'notes', 'expiresAt', 'customFields'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          secret[field] = updateData[field];
        }
      });

      if (updateData.data) {
        secret.encryptedData = encryptedData;
        secret.analysis = newAnalysis;
      }

      secret.version += 1;
      secret.lastModifiedBy = userId;
      secret.updatedAt = new Date();

      await secret.save();

      // Log update
      await this.logSecretAccess(secretId, userId, 'update', 'success', { changeReason });

      return {
        id: secret._id,
        name: secret.name,
        type: secret.type,
        tags: secret.tags,
        notes: secret.notes,
        expiresAt: secret.expiresAt,
        customFields: secret.customFields,
        analysis: secret.analysis,
        version: secret.version,
        updatedAt: secret.updatedAt
      };
    } catch (error) {
      console.error('Update secret error:', error);
      throw error;
    }
  }

  /**
   * Delete secret
   */
  async deleteSecret(secretId, userId) {
    try {
      const secret = await Secret.findOne({
        _id: secretId,
        isActive: true
      }).populate('vault');

      if (!secret) {
        throw new Error('Secret not found');
      }

      // Check delete permissions
      const permissions = await this.getVaultPermissions(secret.vault._id, userId);
      if (!permissions.delete) {
        throw new Error('Delete access denied');
      }

      // Soft delete
      secret.isActive = false;
      secret.deletedAt = new Date();
      secret.deletedBy = userId;
      await secret.save();

      // Log deletion
      await this.logSecretAccess(secretId, userId, 'delete', 'success');

      return { message: 'Secret deleted successfully' };
    } catch (error) {
      console.error('Delete secret error:', error);
      throw error;
    }
  }

  /**
   * Get secret version
   */
  async getSecretVersion(secretId, version, userId) {
    try {
      const secret = await Secret.findOne({
        _id: secretId,
        isActive: true
      }).populate('vault');

      if (!secret) {
        throw new Error('Secret not found');
      }

      // Check read permissions
      const permissions = await this.getVaultPermissions(secret.vault._id, userId);
      if (!permissions.read) {
        throw new Error('Read access denied');
      }

      const versionData = secret.versions.find(v => v.version === parseInt(version));
      if (!versionData) {
        throw new Error('Version not found');
      }

      // Decrypt version data
      const vaultKey = await this.getVaultKey(secret.vault._id, userId);
      const decryptedData = await encryptionService.decryptSecret(versionData.encryptedData, vaultKey);

      // Log access
      await this.logSecretAccess(secretId, userId, 'read_version', 'success', { version });

      return {
        version: versionData.version,
        data: decryptedData,
        createdAt: versionData.createdAt,
        createdBy: versionData.createdBy,
        changeReason: versionData.changeReason
      };
    } catch (error) {
      console.error('Get secret version error:', error);
      throw error;
    }
  }

  /**
   * Restore secret to previous version
   */
  async restoreSecretVersion(secretId, version, userId, reason = '') {
    try {
      const secret = await Secret.findOne({
        _id: secretId,
        isActive: true
      }).populate('vault');

      if (!secret) {
        throw new Error('Secret not found');
      }

      // Check write permissions
      const permissions = await this.getVaultPermissions(secret.vault._id, userId);
      if (!permissions.write) {
        throw new Error('Write access denied');
      }

      const versionData = secret.versions.find(v => v.version === parseInt(version));
      if (!versionData) {
        throw new Error('Version not found');
      }

      // Create new version with current data
      const newVersion = {
        version: secret.version + 1,
        encryptedData: secret.encryptedData,
        createdAt: new Date(),
        createdBy: userId,
        changeReason: `Restored to version ${version}: ${reason}`
      };

      secret.versions.push(newVersion);
      secret.encryptedData = versionData.encryptedData;
      secret.version += 1;
      secret.lastModifiedBy = userId;
      secret.updatedAt = new Date();

      await secret.save();

      // Log restoration
      await this.logSecretAccess(secretId, userId, 'restore', 'success', { restoredVersion: version });

      return {
        message: 'Secret restored successfully',
        newVersion: secret.version,
        restoredFromVersion: version
      };
    } catch (error) {
      console.error('Restore secret version error:', error);
      throw error;
    }
  }

  /**
   * Share secret with another user
   */
  async shareSecret(secretId, shareData, userId) {
    try {
      const { userEmail, permissions, expiresAt, maxAccessCount } = shareData;

      const secret = await Secret.findOne({
        _id: secretId,
        isActive: true
      }).populate('vault');

      if (!secret) {
        throw new Error('Secret not found');
      }

      // Check share permissions
      const vaultPermissions = await this.getVaultPermissions(secret.vault._id, userId);
      if (!vaultPermissions.share) {
        throw new Error('Share access denied');
      }

      // Find target user
      const User = require('../models/user.model');
      const targetUser = await User.findOne({ email: userEmail });
      if (!targetUser) {
        throw new Error('User not found');
      }

      // Check if already shared
      const existingShare = secret.sharedWith.find(s => s.user.toString() === targetUser._id.toString());
      if (existingShare) {
        throw new Error('Secret already shared with this user');
      }

      // Add to shared list
      secret.sharedWith.push({
        user: targetUser._id,
        permissions: {
          read: permissions.read !== false,
          write: permissions.write || false
        },
        sharedAt: new Date(),
        sharedBy: userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxAccessCount: maxAccessCount || null,
        accessCount: 0
      });

      await secret.save();

      // Send notification
      await this.sendShareNotification(targetUser.email, secret.name);

      // Log sharing
      await this.logSecretAccess(secretId, userId, 'share', 'success', { targetUser: targetUser._id });

      return {
        message: 'Secret shared successfully',
        sharedWith: secret.sharedWith[secret.sharedWith.length - 1]
      };
    } catch (error) {
      console.error('Share secret error:', error);
      throw error;
    }
  }

  /**
   * Clone secret to another vault
   */
  async cloneSecret(secretId, targetVaultId, userId, newName = null) {
    try {
      const secret = await Secret.findOne({
        _id: secretId,
        isActive: true
      }).populate('vault');

      if (!secret) {
        throw new Error('Secret not found');
      }

      // Check read permissions on source
      const sourcePermissions = await this.getVaultPermissions(secret.vault._id, userId);
      if (!sourcePermissions.read) {
        throw new Error('Read access denied on source secret');
      }

      // Check write permissions on target vault
      const targetPermissions = await this.getVaultPermissions(targetVaultId, userId);
      if (!targetPermissions.write) {
        throw new Error('Write access denied on target vault');
      }

      // Get decrypted data
      const vaultKey = await this.getVaultKey(secret.vault._id, userId);
      const decryptedData = await encryptionService.decryptSecret(secret.encryptedData, vaultKey);

      // Create in target vault
      const targetVaultKey = await this.getVaultKey(targetVaultId, userId);
      const encryptedData = await encryptionService.encryptSecret(decryptedData, targetVaultKey);

      const clonedSecret = new Secret({
        name: newName || `${secret.name} (Copy)`,
        type: secret.type,
        vault: targetVaultId,
        encryptedData,
        tags: [...secret.tags],
        notes: secret.notes,
        customFields: { ...secret.customFields },
        createdBy: userId,
        lastModifiedBy: userId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await clonedSecret.save();

      // Log cloning
      await this.logSecretAccess(secretId, userId, 'clone', 'success', {
        targetVault: targetVaultId,
        clonedSecret: clonedSecret._id
      });

      return {
        message: 'Secret cloned successfully',
        clonedSecret: {
          id: clonedSecret._id,
          name: clonedSecret.name,
          vault: targetVaultId
        }
      };
    } catch (error) {
      console.error('Clone secret error:', error);
      throw error;
    }
  }

  /**
   * Bulk operations on secrets
   */
  async bulkDelete(secretIds, userId) {
    try {
      const secrets = await Secret.find({
        _id: { $in: secretIds },
        isActive: true
      }).populate('vault');

      if (secrets.length !== secretIds.length) {
        throw new Error('Some secrets not found');
      }

      // Check permissions for all secrets
      for (const secret of secrets) {
        const permissions = await this.getVaultPermissions(secret.vault._id, userId);
        if (!permissions.delete) {
          throw new Error(`Delete access denied for secret: ${secret.name}`);
        }
      }

      // Soft delete all
      await Secret.updateMany(
        { _id: { $in: secretIds }, isActive: true },
        {
          isActive: false,
          deletedAt: new Date(),
          deletedBy: userId
        }
      );

      // Log bulk deletion
      await this.logSecretAccess(null, userId, 'bulk_delete', 'success', { secretIds });

      return {
        message: `${secrets.length} secrets deleted successfully`,
        deletedCount: secrets.length
      };
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  }

  /**
   * Get secret statistics
   */
  async getSecretStats(vaultId, userId) {
    try {
      // Check vault access
      const permissions = await this.getVaultPermissions(vaultId, userId);
      if (!permissions.read) {
        throw new Error('Read access denied');
      }

      const [
        totalSecrets,
        typeBreakdown,
        tagStats,
        expiryStats,
        accessStats
      ] = await Promise.all([
        Secret.countDocuments({ vault: vaultId, isActive: true }),
        Secret.aggregate([
          { $match: { vault: vaultId, isActive: true } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Secret.aggregate([
          { $match: { vault: vaultId, isActive: true } },
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        Secret.aggregate([
          { $match: { vault: vaultId, isActive: true, expiresAt: { $exists: true } } },
          {
            $group: {
              _id: {
                $switch: {
                  branches: [
                    { case: { $lt: ['$expiresAt', new Date(Date.now() + 24 * 60 * 60 * 1000)] }, then: 'expiring_24h' },
                    { case: { $lt: ['$expiresAt', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] }, then: 'expiring_7d' }
                  ],
                  default: 'valid'
                }
              },
              count: { $sum: 1 }
            }
          }
        ]),
        AccessLog.aggregate([
          { $match: { resource: 'secret', 'details.vaultId': vaultId } },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ])
      ]);

      return {
        vaultId,
        totalSecrets,
        typeBreakdown: typeBreakdown.reduce((acc, type) => {
          acc[type._id] = type.count;
          return acc;
        }, {}),
        topTags: tagStats.slice(0, 10),
        expiryBreakdown: expiryStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        accessStats: accessStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Get secret stats error:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  async getVaultPermissions(vaultId, userId) {
    const vaultService = require('./vault.service');
    return await vaultService.getVaultPermissions(vaultId, userId);
  }

  async getVaultKey(vaultId, userId) {
    const vaultService = require('./vault.service');
    return await vaultService.getVaultKey(vaultId, userId);
  }

  async sendShareNotification(email, secretName) {
    const html = `
      <h2>Secret Shared With You</h2>
      <p>You have been granted access to the secret: <strong>${secretName}</strong></p>
      <p>Login to PasswordVault to access the shared secret.</p>
    `;

    const authService = require('./authentication.service');
    await authService.sendEmail(email, 'Secret Shared - PasswordVault', html);
  }

  async logSecretAccess(secretId, userId, action, status, details = {}) {
    try {
      const log = new AccessLog({
        user: userId,
        resource: 'secret',
        resourceId: secretId,
        action,
        status,
        details,
        timestamp: new Date()
      });

      await log.save();
    } catch (error) {
      console.error('Secret access logging error:', error);
    }
  }
}

module.exports = new SecretService();