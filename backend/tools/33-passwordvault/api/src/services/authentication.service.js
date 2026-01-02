const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const axios = require('axios');
const User = require('../models/user.model');
const Organization = require('../models/organization.model');
const AccessLog = require('../models/access-log.model');

class AuthenticationService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.microsoftClientId = process.env.MICROSOFT_CLIENT_ID;
    this.microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    this.githubClientId = process.env.GITHUB_CLIENT_ID;
    this.githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
    this.oktaClientId = process.env.OKTA_CLIENT_ID;
    this.oktaClientSecret = process.env.OKTA_CLIENT_SECRET;
    this.auth0ClientId = process.env.AUTH0_CLIENT_ID;
    this.auth0ClientSecret = process.env.AUTH0_CLIENT_SECRET;
    this.twilioSid = process.env.TWILIO_SID;
    this.twilioToken = process.env.TWILIO_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    this.sendgridApiKey = process.env.SENDGRID_API_KEY;
    this.mailgunApiKey = process.env.MAILGUN_API_KEY;
  }

  /**
   * Register a new user
   */
  async register(userData, organizationId = null) {
    try {
      const { email, password, firstName, lastName, role = 'user' } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        organization: organizationId,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        isActive: true,
        preferences: {
          theme: 'light',
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true
          }
        }
      });

      await user.save();

      // Send verification email
      await this.sendVerificationEmail(user.email, verificationToken);

      // Log registration
      await this.logAccess(user._id, 'registration', 'success', {
        method: 'email',
        ip: userData.ip,
        userAgent: userData.userAgent
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        message: 'User registered successfully. Please check your email for verification.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   */
  async login(credentials, context = {}) {
    try {
      const { email, password, mfaToken } = credentials;

      // Find user
      const user = await User.findOne({ email }).populate('organization');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.logAccess(user._id, 'login', 'failed', {
          reason: 'invalid_password',
          ip: context.ip,
          userAgent: context.userAgent
        });
        throw new Error('Invalid credentials');
      }

      // Check MFA if enabled
      if (user.mfaEnabled) {
        if (!mfaToken) {
          return {
            requiresMfa: true,
            userId: user._id,
            mfaMethods: user.mfaMethods
          };
        }

        const isMfaValid = await this.verifyMfaToken(user._id, mfaToken, user.mfaMethods[0]);
        if (!isMfaValid) {
          await this.logAccess(user._id, 'login', 'failed', {
            reason: 'invalid_mfa',
            ip: context.ip,
            userAgent: context.userAgent
          });
          throw new Error('Invalid MFA token');
        }
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update last login
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();

      // Log successful login
      await this.logAccess(user._id, 'login', 'success', {
        method: 'password',
        ip: context.ip,
        userAgent: context.userAgent
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfaEnabled
        },
        tokens,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Social authentication (Google, Microsoft, GitHub)
   */
  async socialLogin(provider, code, state, context = {}) {
    try {
      let userInfo;

      switch (provider) {
        case 'google':
          userInfo = await this.authenticateWithGoogle(code);
          break;
        case 'microsoft':
          userInfo = await this.authenticateWithMicrosoft(code);
          break;
        case 'github':
          userInfo = await this.authenticateWithGitHub(code);
          break;
        default:
          throw new Error('Unsupported provider');
      }

      // Find or create user
      let user = await User.findOne({ email: userInfo.email });

      if (!user) {
        // Create new user from social profile
        user = new User({
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          socialProfiles: [{
            provider,
            providerId: userInfo.id,
            profileData: userInfo
          }],
          isEmailVerified: true, // Social emails are pre-verified
          isActive: true
        });
        await user.save();
      } else {
        // Update existing user's social profile
        const existingProfile = user.socialProfiles.find(p => p.provider === provider);
        if (!existingProfile) {
          user.socialProfiles.push({
            provider,
            providerId: userInfo.id,
            profileData: userInfo
          });
          await user.save();
        }
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Update last login
      user.lastLogin = new Date();
      user.loginCount += 1;
      await user.save();

      // Log social login
      await this.logAccess(user._id, 'login', 'success', {
        method: `social_${provider}`,
        ip: context.ip,
        userAgent: context.userAgent
      });

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        tokens,
        message: 'Social login successful'
      };
    } catch (error) {
      console.error('Social login error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT access and refresh tokens
   */
  async generateTokens(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      organization: user.organization
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: '7d' });

    // Store refresh token (in production, use Redis or database)
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret);
      const user = await User.findById(decoded.userId);

      if (!user || !user.refreshTokens.some(t => t.token === refreshToken)) {
        throw new Error('Invalid refresh token');
      }

      // Remove expired tokens
      user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
      await user.save();

      return await this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMfa(userId, method = 'totp') {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      let mfaData;

      switch (method) {
        case 'totp':
          mfaData = await this.setupTotpMfa(user);
          break;
        case 'sms':
          mfaData = await this.setupSmsMfa(user);
          break;
        case 'email':
          mfaData = await this.setupEmailMfa(user);
          break;
        default:
          throw new Error('Unsupported MFA method');
      }

      user.mfaEnabled = true;
      user.mfaMethods = [method];
      user.mfaSecret = mfaData.secret;
      await user.save();

      return mfaData;
    } catch (error) {
      console.error('MFA setup error:', error);
      throw error;
    }
  }

  /**
   * Setup TOTP MFA
   */
  async setupTotpMfa(user) {
    const secret = speakeasy.generateSecret({
      name: `PasswordVault (${user.email})`,
      issuer: 'PasswordVault'
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      method: 'totp',
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan the QR code with your authenticator app'
    };
  }

  /**
   * Setup SMS MFA
   */
  async setupSmsMfa(user) {
    if (!user.phoneNumber) {
      throw new Error('Phone number required for SMS MFA');
    }

    // Send test SMS
    await this.sendSms(user.phoneNumber, 'Your MFA verification code will be sent to this number.');

    return {
      method: 'sms',
      message: 'SMS MFA configured. You will receive codes via SMS.'
    };
  }

  /**
   * Setup Email MFA
   */
  async setupEmailMfa(user) {
    return {
      method: 'email',
      message: 'Email MFA configured. You will receive codes via email.'
    };
  }

  /**
   * Verify MFA token
   */
  async verifyMfaToken(userId, token, method) {
    const user = await User.findById(userId);
    if (!user || !user.mfaEnabled) return false;

    switch (method) {
      case 'totp':
        return speakeasy.totp.verify({
          secret: user.mfaSecret,
          encoding: 'base32',
          token,
          window: 2 // Allow 2 time steps (30 seconds each)
        });

      case 'sms':
      case 'email':
        // For SMS/Email, we would check against a stored temporary code
        // This is simplified - in production, store codes with expiration
        return user.tempMfaCode === token && user.tempMfaCodeExpires > Date.now();

      default:
        return false;
    }
  }

  /**
   * Send MFA code via SMS
   */
  async sendMfaSms(userId) {
    const user = await User.findById(userId);
    if (!user || !user.phoneNumber) throw new Error('Phone number not configured');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.tempMfaCode = code;
    user.tempMfaCodeExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    await this.sendSms(user.phoneNumber, `Your MFA code is: ${code}`);
    return { message: 'MFA code sent via SMS' };
  }

  /**
   * Send MFA code via Email
   */
  async sendMfaEmail(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.tempMfaCode = code;
    user.tempMfaCodeExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    await this.sendEmail(user.email, 'MFA Code', `Your MFA code is: ${code}`);
    return { message: 'MFA code sent via email' };
  }

  /**
   * Authenticate with Google OAuth
   */
  async authenticateWithGoogle(code) {
    try {
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      });

      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
      });

      return {
        id: userResponse.data.id,
        email: userResponse.data.email,
        firstName: userResponse.data.given_name,
        lastName: userResponse.data.family_name,
        avatar: userResponse.data.picture
      };
    } catch (error) {
      throw new Error('Google authentication failed');
    }
  }

  /**
   * Authenticate with Microsoft OAuth
   */
  async authenticateWithMicrosoft(code) {
    try {
      const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        client_id: this.microsoftClientId,
        client_secret: this.microsoftClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.MICROSOFT_REDIRECT_URI
      });

      const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
      });

      return {
        id: userResponse.data.id,
        email: userResponse.data.mail || userResponse.data.userPrincipalName,
        firstName: userResponse.data.givenName,
        lastName: userResponse.data.surname,
        avatar: null
      };
    } catch (error) {
      throw new Error('Microsoft authentication failed');
    }
  }

  /**
   * Authenticate with GitHub OAuth
   */
  async authenticateWithGitHub(code) {
    try {
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.githubClientId,
        client_secret: this.githubClientSecret,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI
      }, {
        headers: { Accept: 'application/json' }
      });

      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${tokenResponse.data.access_token}` }
      });

      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `token ${tokenResponse.data.access_token}` }
      });

      const primaryEmail = emailResponse.data.find(email => email.primary).email;

      return {
        id: userResponse.data.id.toString(),
        email: primaryEmail,
        firstName: userResponse.data.name ? userResponse.data.name.split(' ')[0] : userResponse.data.login,
        lastName: userResponse.data.name ? userResponse.data.name.split(' ').slice(1).join(' ') : '',
        avatar: userResponse.data.avatar_url
      };
    } catch (error) {
      throw new Error('GitHub authentication failed');
    }
  }

  /**
   * Send SMS using Twilio
   */
  async sendSms(phoneNumber, message) {
    if (!this.twilioSid || !this.twilioToken) return;

    const twilio = require('twilio')(this.twilioSid, this.twilioToken);
    await twilio.messages.create({
      body: message,
      from: this.twilioPhoneNumber,
      to: phoneNumber
    });
  }

  /**
   * Send email using SendGrid or Mailgun
   */
  async sendEmail(to, subject, html) {
    if (this.sendgridApiKey) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.sendgridApiKey);
      await sgMail.send({
        to,
        from: process.env.FROM_EMAIL || 'noreply@passwordvault.com',
        subject,
        html
      });
    } else if (this.mailgunApiKey) {
      const mailgun = require('mailgun-js')({
        apiKey: this.mailgunApiKey,
        domain: process.env.MAILGUN_DOMAIN
      });
      await mailgun.messages().send({
        from: process.env.FROM_EMAIL || 'noreply@passwordvault.com',
        to,
        subject,
        html
      });
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const html = `
      <h2>Welcome to PasswordVault!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.sendEmail(email, 'Verify Your Email - PasswordVault', html);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token) {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Log access events for audit
   */
  async logAccess(userId, action, status, details = {}) {
    try {
      const log = new AccessLog({
        user: userId,
        action,
        status,
        details,
        timestamp: new Date(),
        ipAddress: details.ip,
        userAgent: details.userAgent
      });

      await log.save();
    } catch (error) {
      console.error('Access logging error:', error);
    }
  }

  /**
   * Validate JWT token
   */
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      const user = await User.findById(decoded.userId).populate('organization');

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization
        },
        tokenData: decoded
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthenticationService();