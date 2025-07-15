/**
 * Configuração do banco de dados MongoDB com Mongoose
 */

import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oipet-saude';

// Configurações do Mongoose
const mongooseOptions = {
  // Configurações de conexão
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  
  // Configurações de buffer
  bufferCommands: false,
  bufferMaxEntries: 0,
};

export const connectDatabase = async (): Promise<void> => {
  try {
    // Eventos de conexão
    mongoose.connection.on('connected', () => {
      logger.info('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('❌ Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // Conectar ao MongoDB
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    
    logger.info('✅ Database connection established successfully');
    
    // Inicializar modelos e índices
    if (process.env.NODE_ENV !== 'test') {
      const { initializeModels } = await import('@/models');
      await initializeModels();
      logger.info('🗂️  Database models and indexes initialized');
    }
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('🔌 Database disconnected successfully');
  } catch (error) {
    logger.error('❌ Error disconnecting from database:', error);
    throw error;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default mongoose;