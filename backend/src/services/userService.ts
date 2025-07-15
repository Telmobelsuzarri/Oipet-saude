/**
 * Serviço de gerenciamento de usuários
 */

import { User, IUser } from '@/models/User';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import bcrypt from 'bcryptjs';

export interface UpdateUserProfile {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface PaginatedUsers {
  users: IUser[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
  adminUsers: number;
}

class UserService {
  /**
   * Obter perfil do usuário
   */
  async getProfile(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }
      
      return user;
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(userId: string, updateData: UpdateUserProfile): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      // Atualizar campos permitidos
      if (updateData.name) {
        user.name = updateData.name;
      }
      
      if (updateData.phone) {
        user.phone = updateData.phone;
      }
      
      if (updateData.avatar) {
        user.avatar = updateData.avatar;
      }

      user.updatedAt = new Date();
      await user.save();

      logger.info(`User profile updated: ${userId}`);
      
      // Retornar usuário sem senha
      return await User.findById(userId).select('-password') as IUser;
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw createError('Senha atual incorreta', 400);
      }

      // Verificar se nova senha é diferente da atual
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw createError('A nova senha deve ser diferente da senha atual', 400);
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Atualizar senha
      user.password = hashedPassword;
      user.updatedAt = new Date();
      await user.save();

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Desativar conta do usuário
   */
  async deactivateAccount(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      user.isActive = false;
      user.updatedAt = new Date();
      await user.save();

      logger.info(`User account deactivated: ${userId}`);
    } catch (error) {
      logger.error('Error deactivating account:', error);
      throw error;
    }
  }

  /**
   * Reativar conta do usuário
   */
  async reactivateAccount(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      user.isActive = true;
      user.updatedAt = new Date();
      await user.save();

      logger.info(`User account reactivated: ${userId}`);
    } catch (error) {
      logger.error('Error reactivating account:', error);
      throw error;
    }
  }

  /**
   * Buscar usuários com paginação (Admin)
   */
  async getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    isActive?: boolean
  ): Promise<PaginatedUsers> {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros
      const filters: any = {};
      
      if (search) {
        filters.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (isActive !== undefined) {
        filters.isActive = isActive;
      }

      // Buscar usuários
      const users = await User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Contar total
      const total = await User.countDocuments(filters);
      const totalPages = Math.ceil(total / limit);

      return {
        users,
        total,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de usuários (Admin)
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisMonth,
        verifiedUsers,
        adminUsers
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: today } }),
        User.countDocuments({ createdAt: { $gte: thisMonth } }),
        User.countDocuments({ isEmailVerified: true }),
        User.countDocuments({ isAdmin: true })
      ]);

      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisMonth,
        verifiedUsers,
        adminUsers
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Buscar usuário por ID (Admin)
   */
  async getUserById(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }
      
      return user;
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Atualizar usuário (Admin)
   */
  async updateUser(userId: string, updateData: any): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      // Campos permitidos para admin
      const allowedFields = ['name', 'email', 'phone', 'avatar', 'isActive', 'isAdmin', 'isEmailVerified'];
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          user[key] = updateData[key];
        }
      });

      user.updatedAt = new Date();
      await user.save();

      logger.info(`User updated by admin: ${userId}`);
      
      return await User.findById(userId).select('-password') as IUser;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Deletar usuário (Admin)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw createError('Usuário não encontrado', 404);
      }

      // Não permitir deletar admin
      if (user.isAdmin) {
        throw createError('Não é possível deletar usuário administrador', 403);
      }

      await User.findByIdAndDelete(userId);

      logger.info(`User deleted by admin: ${userId}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;