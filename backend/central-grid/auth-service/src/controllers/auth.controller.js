const User = require('../../../../shared/models/User.model');
const Session = require('../../../../shared/models/Session.model');
const { ApiError } = require('../../../../shared/utils/apiError');
const { ApiResponse } = require('../../../../shared/utils/apiResponse');
const crypto = require('crypto');
const logger = require('../../../../shared/utils/logger');

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const { email, password, name, organization } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw ApiError.conflict('Email already registered');
      }

      // Create user
      const user = new User({
        email,
        password,
        name,
        organization,
        role: 'user',
        permissions: ['read', 'write']
      });

      await user.save();

      // Generate auth token
      const token = user.generateAuthToken();

      // Create session
      const session = new Session({
        userId: user._id,
        token,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      await session.save();

      logger.info(`New user registered: ${email}`);

      res.status(201).json(ApiResponse.created({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        },
        token,
        expiresIn: '7d'
      }, 'User registered successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw ApiError.forbidden('Account is locked due to too many failed login attempts. Please try again later.');
      }

      // Check if account is active
      if (!user.isActive) {
        throw ApiError.forbidden('Account is deactivated. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate auth token
      const token = user.generateAuthToken();

      // Create session
      const session = new Session({
        userId: user._id,
        token,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await session.save();

      logger.info(`User logged in: ${email}`);

      res.json(ApiResponse.success({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          organization: user.organization
        },
        token,
        expiresIn: '7d'
      }, 'Login successful'));
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        const session = await Session.findOne({ token, isActive: true });
        if (session) {
          await session.revoke();
        }
      }

      logger.info(`User logged out: ${req.user.email}`);

      res.json(ApiResponse.success(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      res.json(ApiResponse.success(user, 'Profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  async updateProfile(req, res, next) {
    try {
      const { name, organization, avatar } = req.body;

      const user = await User.findById(req.user.id);
      
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      if (name) user.name = name;
      if (organization) user.organization = organization;
      if (avatar) user.avatar = avatar;

      await user.save();

      logger.info(`Profile updated: ${user.email}`);

      res.json(ApiResponse.success(user, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select('+password');
      
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Revoke all existing sessions
      await Session.updateMany(
        { userId: user._id, isActive: true },
        { isActive: false }
      );

      // Generate new token
      const token = user.generateAuthToken();

      // Create new session
      const session = new Session({
        userId: user._id,
        token,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await session.save();

      logger.info(`Password changed: ${user.email}`);

      res.json(ApiResponse.success({
        token,
        expiresIn: '7d'
      }, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Request password reset
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      
      if (!user) {
        // Don't reveal if email exists
        res.json(ApiResponse.success(null, 'If the email exists, a reset link has been sent'));
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

      await user.save();

      // TODO: Send email with reset link
      // const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
      
      logger.info(`Password reset requested: ${email}`);

      res.json(ApiResponse.success({
        resetToken // TODO: Remove this in production, only for development
      }, 'Password reset link sent to email'));
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw ApiError.badRequest('Invalid or expired reset token');
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      await user.save();

      // Revoke all existing sessions
      await Session.updateMany(
        { userId: user._id, isActive: true },
        { isActive: false }
      );

      logger.info(`Password reset completed: ${user.email}`);

      res.json(ApiResponse.success(null, 'Password reset successful. Please login with your new password.'));
    } catch (error) {
      next(error);
    }
  }

  // Verify session
  async verifySession(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      const session = await Session.findOne({ token, isActive: true })
        .populate('userId', 'email name role permissions');

      if (!session) {
        throw ApiError.unauthorized('Invalid session');
      }

      if (session.expiresAt < Date.now()) {
        throw ApiError.unauthorized('Session expired');
      }

      await session.updateActivity();

      res.json(ApiResponse.success({
        valid: true,
        user: session.userId
      }, 'Session is valid'));
    } catch (error) {
      next(error);
    }
  }

  // Get all active sessions
  async getSessions(req, res, next) {
    try {
      const sessions = await Session.find({
        userId: req.user.id,
        isActive: true
      }).sort({ lastActivity: -1 });

      res.json(ApiResponse.success(sessions, 'Sessions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  // Revoke session
  async revokeSession(req, res, next) {
    try {
      const { sessionId } = req.params;

      const session = await Session.findOne({
        _id: sessionId,
        userId: req.user.id
      });

      if (!session) {
        throw ApiError.notFound('Session not found');
      }

      await session.revoke();

      logger.info(`Session revoked: ${req.user.email}`);

      res.json(ApiResponse.success(null, 'Session revoked successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
