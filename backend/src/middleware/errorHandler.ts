/**
 * Middleware de tratamento de erros
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { method, originalUrl, ip } = req;
  
  // Log do erro
  logger.error(`${method} ${originalUrl} - ${ip}`, {
    error: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
  });

  // Erro de validação do Mongoose
  if (error.name === 'ValidationError') {
    const messages = Object.values((error as any).errors).map((err: any) => err.message);
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: messages,
    });
  }

  // Erro de chave duplicada no MongoDB
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} já está em uso`,
    });
  }

  // Erro de casting do Mongoose
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID inválido',
    });
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
    });
  }

  // Erro padrão
  const statusCode = error.statusCode || 500;
  const message = error.isOperational 
    ? error.message 
    : 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  });
};

// Wrapper para funções async
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Criar erro personalizado
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};