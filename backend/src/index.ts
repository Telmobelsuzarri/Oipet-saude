/**
 * OiPet Saúde Backend
 * Servidor principal Express.js + TypeScript
 */

// Configurar dotenv PRIMEIRO!
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

// Importações locais
import { connectDatabase } from '@/config/database';
import { connectRedis, disconnectRedis } from '@/config/redis';
import { setupSwagger } from '@/config/swagger';
import { serveUploads } from '@/config/storage';
import { logger } from '@/utils/logger';
import { MonitoringService } from '@/services/monitoringService';
import { BackupService } from '@/services/backupService';
import { errorHandler } from '@/middleware/errorHandler';
import { notFound } from '@/middleware/notFound';
import { 
  securityHeaders, 
  securityLogger, 
  sanitizeInput,
  corsSecurityOptions,
  apiLimiter,
  authLimiter 
} from '@/middleware/security';

// Rotas
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import petRoutes from '@/routes/pets';
import healthRoutes from '@/routes/health';
import notificationRoutes from '@/routes/notifications';
import analyticsRoutes from '@/routes/analytics';
import adminRoutes from '@/routes/admin';
import productRoutes from '@/routes/products';
import ecommerceAnalyticsRoutes from '@/routes/ecommerce-analytics';
import uploadRoutes from '@/routes/upload';
import monitoringRoutes from '@/routes/monitoring';
import backupRoutes from '@/routes/backup';

// Debug removido - servidor funcionando!

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Security middleware (must be first)
app.use(securityHeaders);
app.use(securityLogger);

// Enhanced helmet configuration
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Enhanced CORS with security
app.use(cors(corsSecurityOptions));

// Input sanitization
app.use(sanitizeInput);

// Rate limiting - general API
app.use('/api', apiLimiter);

// Middlewares básicos
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    service: 'OiPet Saúde Backend'
  });
});

// Rotas da API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ecommerce-analytics', ecommerceAnalyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/backup', backupRoutes);

// Serve static uploads
serveUploads(app);

// Documentação Swagger
setupSwagger(app);

// Middleware de erro 404
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

// Inicializar servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Conectar ao Redis (opcional)
    await connectRedis();
    logger.info('✅ Redis connected successfully');

    // Iniciar monitoramento
    MonitoringService.startMonitoring(60000); // 1 minuto

    // Inicializar sistema de backup
    await BackupService.initialize();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      // Stop monitoring
      await MonitoringService.handleShutdown(signal);
      
      // Disconnect Redis
      await disconnectRedis();
      
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Inicializar apenas se não estiver em teste
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;