const organizationService = require('../services/organization.service');
const { validationResult } = require('express-validator');

class OrganizationController {
  /**
   * Create a new organization
   */
  async createOrganization(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, description, settings } = req.body;
      const userId = req.user.userId;

      const organization = await organizationService.createOrganization({
        name,
        description,
        settings,
        owner: userId
      });

      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        organization
      });
    } catch (error) {
      console.error('Create organization error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;

      const organization = await organizationService.getOrganization(organizationId, userId);

      res.json({
        success: true,
        organization
      });
    } catch (error) {
      console.error('Get organization error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await organizationService.getUserOrganizations(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        organizations: result.organizations,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get user organizations error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { organizationId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const organization = await organizationService.updateOrganization(organizationId, userId, updates);

      res.json({
        success: true,
        message: 'Organization updated successfully',
        organization
      });
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete organization
   */
  async deleteOrganization(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;

      await organizationService.deleteOrganization(organizationId, userId);

      res.json({
        success: true,
        message: 'Organization deleted successfully'
      });
    } catch (error) {
      console.error('Delete organization error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Invite user to organization
   */
  async inviteUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { organizationId } = req.params;
      const { email, role, message } = req.body;
      const inviterId = req.user.userId;

      const result = await organizationService.inviteUser(organizationId, inviterId, email, role, message);

      res.json({
        success: true,
        message: result.message,
        invitation: result.invitation
      });
    } catch (error) {
      console.error('Invite user error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Accept organization invitation
   */
  async acceptInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.userId;

      const result = await organizationService.acceptInvitation(invitationId, userId);

      res.json({
        success: true,
        message: result.message,
        organization: result.organization
      });
    } catch (error) {
      console.error('Accept invitation error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Decline organization invitation
   */
  async declineInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.userId;

      await organizationService.declineInvitation(invitationId, userId);

      res.json({
        success: true,
        message: 'Invitation declined'
      });
    } catch (error) {
      console.error('Decline invitation error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get pending invitations for user
   */
  async getPendingInvitations(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await organizationService.getPendingInvitations(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        invitations: result.invitations,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get pending invitations error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get organization members
   */
  async getOrganizationMembers(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 20, search, role } = req.query;

      const result = await organizationService.getOrganizationMembers(organizationId, userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role
      });

      res.json({
        success: true,
        members: result.members,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get organization members error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(req, res) {
    try {
      const { organizationId, memberId } = req.params;
      const { role } = req.body;
      const userId = req.user.userId;

      const member = await organizationService.updateMemberRole(organizationId, memberId, userId, role);

      res.json({
        success: true,
        message: 'Member role updated successfully',
        member
      });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remove member from organization
   */
  async removeMember(req, res) {
    try {
      const { organizationId, memberId } = req.params;
      const userId = req.user.userId;

      await organizationService.removeMember(organizationId, memberId, userId);

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Transfer organization ownership
   */
  async transferOwnership(req, res) {
    try {
      const { organizationId } = req.params;
      const { newOwnerId } = req.body;
      const currentOwnerId = req.user.userId;

      const result = await organizationService.transferOwnership(organizationId, currentOwnerId, newOwnerId);

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
   * Get organization settings
   */
  async getOrganizationSettings(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;

      const settings = await organizationService.getOrganizationSettings(organizationId, userId);

      res.json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Get organization settings error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(req, res) {
    try {
      const { organizationId } = req.params;
      const { settings } = req.body;
      const userId = req.user.userId;

      const updatedSettings = await organizationService.updateOrganizationSettings(organizationId, userId, settings);

      res.json({
        success: true,
        message: 'Organization settings updated successfully',
        settings: updatedSettings
      });
    } catch (error) {
      console.error('Update organization settings error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;

      const stats = await organizationService.getOrganizationStats(organizationId, userId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get organization stats error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get organization activity log
   */
  async getOrganizationActivity(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 50, action, startDate, endDate } = req.query;

      const result = await organizationService.getOrganizationActivity(organizationId, userId, {
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
      console.error('Get organization activity error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create organization API key
   */
  async createApiKey(req, res) {
    try {
      const { organizationId } = req.params;
      const { name, permissions, expiresAt } = req.body;
      const userId = req.user.userId;

      const apiKey = await organizationService.createApiKey(organizationId, userId, {
        name,
        permissions,
        expiresAt
      });

      res.status(201).json({
        success: true,
        message: 'API key created successfully',
        apiKey
      });
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get organization API keys
   */
  async getApiKeys(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;
      const { page = 1, limit = 20 } = req.query;

      const result = await organizationService.getApiKeys(organizationId, userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        apiKeys: result.apiKeys,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update API key
   */
  async updateApiKey(req, res) {
    try {
      const { organizationId, keyId } = req.params;
      const updates = req.body;
      const userId = req.user.userId;

      const apiKey = await organizationService.updateApiKey(organizationId, keyId, userId, updates);

      res.json({
        success: true,
        message: 'API key updated successfully',
        apiKey
      });
    } catch (error) {
      console.error('Update API key error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete API key
   */
  async deleteApiKey(req, res) {
    try {
      const { organizationId, keyId } = req.params;
      const userId = req.user.userId;

      await organizationService.deleteApiKey(organizationId, keyId, userId);

      res.json({
        success: true,
        message: 'API key deleted successfully'
      });
    } catch (error) {
      console.error('Delete API key error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Regenerate API key
   */
  async regenerateApiKey(req, res) {
    try {
      const { organizationId, keyId } = req.params;
      const userId = req.user.userId;

      const apiKey = await organizationService.regenerateApiKey(organizationId, keyId, userId);

      res.json({
        success: true,
        message: 'API key regenerated successfully',
        apiKey
      });
    } catch (error) {
      console.error('Regenerate API key error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get organization billing info
   */
  async getBillingInfo(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;

      const billing = await organizationService.getBillingInfo(organizationId, userId);

      res.json({
        success: true,
        billing
      });
    } catch (error) {
      console.error('Get billing info error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update organization billing
   */
  async updateBilling(req, res) {
    try {
      const { organizationId } = req.params;
      const billingData = req.body;
      const userId = req.user.userId;

      const billing = await organizationService.updateBilling(organizationId, userId, billingData);

      res.json({
        success: true,
        message: 'Billing information updated successfully',
        billing
      });
    } catch (error) {
      console.error('Update billing error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get organization subscription
   */
  async getSubscription(req, res) {
    try {
      const { organizationId } = req.params;
      const userId = req.user.userId;

      const subscription = await organizationService.getSubscription(organizationId, userId);

      res.json({
        success: true,
        subscription
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update organization subscription
   */
  async updateSubscription(req, res) {
    try {
      const { organizationId } = req.params;
      const { planId } = req.body;
      const userId = req.user.userId;

      const subscription = await organizationService.updateSubscription(organizationId, userId, planId);

      res.json({
        success: true,
        message: 'Subscription updated successfully',
        subscription
      });
    } catch (error) {
      console.error('Update subscription error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new OrganizationController();