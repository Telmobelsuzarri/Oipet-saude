/**
 * AuthService - Serviço de autenticação
 */

import { apiService } from './api';

interface LoginResponse {
  user: {
    _id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    isAdmin: boolean;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export class AuthService {
  /**
   * Fazer login
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiService.post('/auth/login', { email, password });
    return response.data.data;
  }

  /**
   * Registrar novo usuário
   */
  static async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await apiService.post('/auth/register', userData);
    return response.data.data;
  }

  /**
   * Renovar token de acesso
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiService.post('/auth/refresh', { refreshToken });
    return response.data.data;
  }

  /**
   * Fazer logout
   */
  static async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  /**
   * Solicitar reset de senha
   */
  static async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  /**
   * Resetar senha
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, password: newPassword });
  }

  /**
   * Verificar email
   */
  static async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/verify-email', { token });
  }

  /**
   * Reenviar email de verificação
   */
  static async resendVerificationEmail(): Promise<void> {
    await apiService.post('/auth/resend-verification');
  }
}