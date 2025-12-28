import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

interface TokenPayload {
  userId: string;
  email: string;
  subscription: string;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export class JWTService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static REFRESH_TOKEN_EXPIRES_IN = '30d';

  /**
   * Generate access token
   */
  static generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      subscription: user.subscription.plan
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'maula.ai',
      audience: 'maula.ai'
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      subscription: user.subscription.plan
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'maula.ai',
      audience: 'maula.ai'
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokens(user: IUser): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'maula.ai',
        audience: 'maula.ai'
      }) as DecodedToken;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'maula.ai',
        audience: 'maula.ai'
      }) as DecodedToken;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decode(token: string): DecodedToken | null {
    try {
      return jwt.decode(token) as DecodedToken;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decode(token);
      if (!decoded) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decode(token);
      if (!decoded) return null;

      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
}
