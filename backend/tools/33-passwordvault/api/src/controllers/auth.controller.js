const authService = require('../services/authentication.service');
const { validationResult } = require('express-validator');

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, firstName, lastName, organizationId } = req.body;

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      }, organizationId);

      res.status(201).json({
        success: true,
        message: result.message,
        user: result.user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Login user
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, mfaToken } = req.body;
      const context = {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await authService.login({
        email,
        password,
        mfaToken
      }, context);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        message: result.message,
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Social authentication
   */
  async socialLogin(req, res) {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;

      const context = {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await authService.socialLogin(provider, code, state, context);

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        message: result.message,
        user: result.user,
        accessToken: result.tokens.accessToken,
        expiresIn: result.tokens.expiresIn
      });
    } catch (error) {
      console.error('Social login error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        // Invalidate refresh token (implementation depends on storage method)
        // For now, just clear the cookie
      }

      res.clearCookie('refreshToken');
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  /**
   * Setup MFA
   */
  async setupMfa(req, res) {
    try {
      const { method } = req.body;
      const userId = req.user.userId;

      const mfaData = await authService.setupMfa(userId, method);

      res.json({
        success: true,
        mfa: mfaData
      });
    } catch (error) {
      console.error('MFA setup error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verify MFA token
   */
  async verifyMfa(req, res) {
    try {
      const { token, method } = req.body;
      const userId = req.user.userId;

      const isValid = await authService.verifyMfaToken(userId, token, method);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid MFA token'
        });
      }

      res.json({
        success: true,
        message: 'MFA token verified'
      });
    } catch (error) {
      console.error('MFA verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Send MFA code
   */
  async sendMfaCode(req, res) {
    try {
      const { method } = req.body;
      const userId = req.user.userId;

      let result;
      if (method === 'sms') {
        result = await authService.sendMfaSms(userId);
      } else if (method === 'email') {
        result = await authService.sendMfaEmail(userId);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported MFA method'
        });
      }

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Send MFA code error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      const result = await authService.verifyEmail(token);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(req, res) {
    try {
      const userId = req.user.userId;
      const User = require('../models/user.model');

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      // Generate new verification token
      const verificationToken = require('crypto').randomBytes(32).toString('hex');
      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      await authService.sendVerificationEmail(user.email, verificationToken);

      res.json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const User = require('../models/user.model');

      const user = await User.findById(userId)
        .populate('organization', 'name')
        .select('-password -refreshTokens -emailVerificationToken -tempMfaCode');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfaEnabled,
          mfaMethods: user.mfaMethods,
          lastLogin: user.lastLogin,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updates = req.body;
      const User = require('../models/user.model');

      // Prevent updating sensitive fields
      const allowedFields = ['firstName', 'lastName', 'preferences'];
      const filteredUpdates = {};

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });

      const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
      ).populate('organization', 'name')
        .select('-password -refreshTokens -emailVerificationToken -tempMfaCode');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfaEnabled,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;
      const User = require('../models/user.model');
      const bcrypt = require('bcryptjs');

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const User = require('../models/user.model');

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const html = `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your PasswordVault account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      await authService.sendEmail(email, 'Password Reset - PasswordVault', html);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const User = require('../models/user.model');
      const bcrypt = require('bcryptjs');

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.userId;
      const User = require('../models/user.model');
      const bcrypt = require('bcryptjs');

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }

      user.isActive = false;
      user.deactivatedAt = new Date();
      await user.save();

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();