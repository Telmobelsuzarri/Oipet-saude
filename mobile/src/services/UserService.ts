/**
 * UserService - Serviço de usuário
 */

import { apiService } from './api';

interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export class UserService {
  /**
   * Obter perfil do usuário
   */
  static async getProfile() {
    return await apiService.get('/users/profile');
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(data: UpdateProfileData) {
    return await apiService.put('/users/profile', data);
  }

  /**
   * Alterar senha
   */
  static async changePassword(currentPassword: string, newPassword: string) {
    return await apiService.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Desativar conta
   */
  static async deactivateAccount() {
    return await apiService.delete('/users/deactivate');
  }

  /**
   * Upload de avatar
   */
  static async uploadAvatar(file: any, onProgress?: (progress: number) => void) {
    return await apiService.uploadFile('/users/avatar', file, onProgress);
  }
}