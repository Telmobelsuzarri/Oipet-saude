/**
 * Serviço de Autenticação JWT
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, IUser } from '@/models/User';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: IUser;
  tokens: AuthTokens;
}

export interface RefreshResult {
  accessToken: string;
  user: IUser;
}

class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  /**
   * Gerar token de acesso
   */
  generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      type: 'access',
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'oipet-saude',
      audience: 'oipet-users',
    } as any);
  }

  /**
   * Gerar token de refresh
   */
  generateRefreshToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      type: 'refresh',
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: 'oipet-saude',
      audience: 'oipet-users',
    } as any);
  }

  /**
   * Gerar ambos os tokens
   */
  generateTokens(user: IUser): AuthTokens {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * Verificar token de acesso
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      logger.error('Invalid access token:', error);
      throw createError('Token inválido', 401);
    }
  }

  /**
   * Verificar token de refresh
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      logger.error('Invalid refresh token:', error);
      throw createError('Token de refresh inválido', 401);
    }
  }

  /**
   * Registrar novo usuário
   */
  async register(userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<LoginResult> {
    try {
      // Verificar se email já existe
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw createError('Email já está em uso', 409);
      }

      // Criar usuário
      const user = new User(userData);
      await user.save();

      // Gerar tokens
      const tokens = this.generateTokens(user);

      // Atualizar último login
      user.lastLoginAt = new Date();
      await user.save();

      logger.info(`User registered: ${user.email}`);

      return {
        user,
        tokens,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Fazer login
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Buscar usuário com senha
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw createError('Credenciais inválidas', 401);
      }

      // Verificar senha
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw createError('Credenciais inválidas', 401);
      }

      // Gerar tokens
      const tokens = this.generateTokens(user);

      // Atualizar último login
      user.lastLoginAt = new Date();
      await user.save();

      logger.info(`User logged in: ${user.email}`);

      return {
        user,
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Renovar token de acesso
   */
  async refreshToken(refreshToken: string): Promise<RefreshResult> {
    try {
      // Verificar refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Buscar usuário
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      // Gerar novo access token
      const accessToken = this.generateAccessToken(user);

      logger.info(`Token refreshed for user: ${user.email}`);

      return {
        accessToken,
        user,
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Obter usuário pelo token
   */
  async getUserByToken(token: string): Promise<IUser> {
    try {
      const decoded = this.verifyAccessToken(token);
      
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      return user;
    } catch (error) {
      logger.error('Get user by token error:', error);
      throw error;
    }
  }

  /**
   * Gerar token de verificação de email
   */
  async generateEmailVerificationToken(userId: string): Promise<string> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      const token = user.generateEmailVerificationToken();
      await user.save();

      return token;
    } catch (error) {
      logger.error('Generate email verification token error:', error);
      throw error;
    }
  }

  /**
   * Verificar email com token
   */
  async verifyEmail(token: string): Promise<IUser> {
    try {
      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        throw createError('Token de verificação inválido', 400);
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      logger.info(`Email verified for user: ${user.email}`);

      return user;
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Gerar token de reset de senha
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      const token = user.generatePasswordResetToken();
      await user.save();

      logger.info(`Password reset token generated for user: ${user.email}`);

      return token;
    } catch (error) {
      logger.error('Generate password reset token error:', error);
      throw error;
    }
  }

  /**
   * Resetar senha com token
   */
  async resetPassword(token: string, newPassword: string): Promise<IUser> {
    try {
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw createError('Token de reset inválido ou expirado', 400);
      }

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      logger.info(`Password reset for user: ${user.email}`);

      return user;
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Atualizar FCM token
   */
  async updateFCMToken(userId: string, fcmToken: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { fcmToken });
      logger.info(`FCM token updated for user: ${userId}`);
    } catch (error) {
      logger.error('Update FCM token error:', error);
      throw error;
    }
  }

  /**
   * Logout (apenas log - tokens JWT são stateless)
   */
  async logout(userId: string): Promise<void> {
    try {
      // Em um sistema mais complexo, poderia adicionar o token a uma blacklist
      // Por ora, apenas log
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Validar força da senha
   */
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (password.length > 128) {
      errors.push('Senha deve ter no máximo 128 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gerar senha aleatória
   */
  generateRandomPassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

export const authService = new AuthService();
export default authService;