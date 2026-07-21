import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AuthRepository } from './auth.repository.js';
import { sendEmail } from '../../infrastructure/email/email.client.js';
import { AuthenticationError, ConflictError, ForbiddenError } from '../../types/errors.js';

export class AuthService {
  static _generateHash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static _generateTokens(user) {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName || '',
        role: user.role,
        tenantId: user.tenantId,
      },
      env.JWT_SECRET,
      {
        expiresIn: `${env.JWT_ACCESS_EXPIRY_SECONDS}s`,
        issuer: env.JWT_ISSUER,
      }
    );

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = AuthService._generateHash(rawRefreshToken);
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRY_SECONDS * 1000);

    return {
      accessToken,
      rawRefreshToken,
      tokenHash,
      expiresAt,
    };
  }

  static async register(data) {
    const existingUser = await AuthRepository.findUserByEmail(data.adminEmail);
    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.adminPassword, env.BCRYPT_ROUNDS);

    const result = await AuthRepository.createInstitutionAndAdmin({
      institutionName: data.institutionName,
      adminEmail: data.adminEmail,
      passwordHash,
      adminFirstName: data.adminFirstName,
      adminLastName: data.adminLastName,
      contactPhone: data.contactPhone,
    });

    return {
      institutionId: result.institution.id,
      userId: result.user.id,
      message: 'Institution registered successfully. Awaiting subscription activation.',
    };
  }

  static async login({ email, password }) {
    const user = await AuthRepository.findUserByEmail(email);

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Your account is deactivated');
    }

    // Access policy: super_admin/platform_owner bypass, admin can log in to pending/active, others must be active
    const tenantStatus = user.tenant?.status;
    if (!['super_admin', 'platform_owner'].includes(user.role) && user.role !== 'admin' && tenantStatus !== 'active') {
      throw new ForbiddenError('Your institution subscription is inactive or pending activation');
    }

    const { accessToken, rawRefreshToken, tokenHash, expiresAt } = AuthService._generateTokens(user);

    await AuthRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRY_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  static async refresh(refreshToken) {
    const tokenHash = AuthService._generateHash(refreshToken);
    const storedToken = await AuthRepository.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (storedToken.revokedAt) {
      // Security Event: Token reuse detection! Revoke ALL user tokens
      await AuthRepository.revokeAllUserRefreshTokens(storedToken.userId);
      throw new AuthenticationError('Refresh token was previously used and revoked. Compromise detected.');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new AuthenticationError('Refresh token expired');
    }

    const user = await AuthRepository.findUserById(storedToken.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User is inactive or not found');
    }

    // Revoke old token
    await AuthRepository.revokeRefreshToken(storedToken.id);

    // Generate new tokens
    const { accessToken, rawRefreshToken, tokenHash: newTokenHash, expiresAt } = AuthService._generateTokens(user);

    await AuthRepository.createRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRY_SECONDS,
    };
  }

  static async logout(refreshToken) {
    const tokenHash = AuthService._generateHash(refreshToken);
    const storedToken = await AuthRepository.findRefreshToken(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await AuthRepository.revokeRefreshToken(storedToken.id);
    }

    return { message: 'Logged out successfully' };
  }

  static async forgotPassword({ email }) {
    // Always return success to prevent user enumeration
    const user = await AuthRepository.findUserByEmail(email);
    if (!user || !user.isActive) {
      return { message: 'If that email exists, a reset link has been sent.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = AuthService._generateHash(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await AuthRepository.createPasswordResetToken({ userId: user.id, tokenHash, expiresAt });

    const resetUrl = `${env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${rawToken}`;
    await sendEmail(
      user.email,
      'EduOMR — Password Reset Request',
      `Click the link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
      `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 1 hour.</p>`
    );

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  static async resetPassword({ token, password }) {
    const tokenHash = AuthService._generateHash(token);
    const resetToken = await AuthRepository.findPasswordResetToken(tokenHash);

    if (!resetToken) {
      throw new AuthenticationError('Invalid or expired reset token');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new AuthenticationError('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    await AuthRepository.updateUserPassword(resetToken.userId, passwordHash);
    await AuthRepository.markPasswordResetTokenUsed(resetToken.id);
    // Revoke all refresh tokens for security
    await AuthRepository.revokeAllUserRefreshTokens(resetToken.userId);

    return { message: 'Password reset successfully. Please log in with your new password.' };
  }
}
