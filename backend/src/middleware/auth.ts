/**
 * Middleware de Autenticação
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/authService';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

// Estender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware de autenticação obrigatória
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next(createError('Token de acesso não fornecido', 401));
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next(createError('Token de acesso inválido', 401));
    }

    // Verificar e decodificar token
    const decoded = authService.verifyAccessToken(token);
    
    // Buscar usuário
    const user = await authService.getUserByToken(token);
    
    // Adicionar usuário ao request
    req.user = user;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

/**
 * Middleware de autenticação opcional
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    try {
      const user = await authService.getUserByToken(token);
      req.user = user;
    } catch (error) {
      // Token inválido, mas não bloqueia a requisição
      logger.warn('Optional auth failed:', error);
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication error:', error);
    next(error);
  }
};

/**
 * Middleware de autorização para administradores
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('Acesso negado - autenticação necessária', 401));
  }

  if (!req.user.isAdmin) {
    return next(createError('Acesso negado - privilégios administrativos necessários', 403));
  }

  next();
};

/**
 * Middleware de autorização para usuários verificados
 */
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('Acesso negado - autenticação necessária', 401));
  }

  if (!req.user.isEmailVerified) {
    return next(createError('Acesso negado - email não verificado', 403));
  }

  next();
};

/**
 * Middleware de autorização para proprietário do recurso
 */
export const requireOwnership = (resourceIdParam: string = 'id', userIdField: string = 'userId') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(createError('Acesso negado - autenticação necessária', 401));
      }

      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return next(createError('ID do recurso não fornecido', 400));
      }

      // Para admins, permitir acesso a qualquer recurso
      if (req.user.isAdmin) {
        return next();
      }

      // Verificar se o usuário é o proprietário
      // Isso pode ser customizado baseado no modelo
      const userId = req.user._id.toString();
      
      // Se o recurso tem um campo userId, verificar
      if (req.body && req.body[userIdField]) {
        if (req.body[userIdField] !== userId) {
          return next(createError('Acesso negado - você não tem permissão para este recurso', 403));
        }
      }

      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      next(error);
    }
  };
};

/**
 * Middleware para verificar se o usuário pode acessar dados de um pet
 */
export const requirePetOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(createError('Acesso negado - autenticação necessária', 401));
    }

    const petId = req.params.petId || req.params.id;
    
    if (!petId) {
      return next(createError('ID do pet não fornecido', 400));
    }

    // Admin pode acessar qualquer pet
    if (req.user.isAdmin) {
      return next();
    }

    // Verificar se o pet pertence ao usuário
    const { Pet } = await import('@/models/Pet');
    const pet = await Pet.findById(petId);
    
    if (!pet) {
      return next(createError('Pet não encontrado', 404));
    }

    if (pet.userId.toString() !== req.user._id.toString()) {
      return next(createError('Acesso negado - este pet não pertence a você', 403));
    }

    // Adicionar pet ao request para uso posterior
    req.pet = pet;
    
    next();
  } catch (error) {
    logger.error('Pet ownership check error:', error);
    next(error);
  }
};

/**
 * Middleware para rate limiting baseado em usuário
 */
export const userRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id?.toString() || req.ip;
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userLimit = userRequests.get(userId);
    
    if (now > userLimit.resetTime) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return next(createError('Muitas requisições - tente novamente mais tarde', 429));
    }

    userLimit.count++;
    next();
  };
};

/**
 * Middleware para logging de ações dos usuários
 */
export const logUserAction = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id || 'anonymous';
    const userEmail = req.user?.email || 'anonymous';
    
    logger.info(`User action: ${action}`, {
      userId,
      userEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
    });
    
    next();
  };
};

/**
 * Middleware para verificar se o usuário está ativo
 */
export const requireActiveUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(createError('Acesso negado - autenticação necessária', 401));
  }

  // Verificar se o usuário não foi desativado
  if (req.user.isActive === false) {
    return next(createError('Conta desativada - entre em contato com o suporte', 403));
  }

  next();
};