/**
 * Middleware para rotas não encontradas
 */

import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: error.message,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
};