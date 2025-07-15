/**
 * Configuração de testes com Jest
 */

import { connectDatabase, disconnectDatabase } from '@/config/database';
import { logger } from '@/utils/logger';

// Configurar environment de teste
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/oipet-saude-test';

// Conectar ao banco de dados antes dos testes
beforeAll(async () => {
  try {
    await connectDatabase();
    logger.info('🧪 Test database connected');
  } catch (error) {
    logger.error('❌ Failed to connect to test database:', error);
    process.exit(1);
  }
});

// Desconectar após os testes
afterAll(async () => {
  try {
    await disconnectDatabase();
    logger.info('🧪 Test database disconnected');
  } catch (error) {
    logger.error('❌ Failed to disconnect from test database:', error);
  }
});

// Limpar dados entre testes
beforeEach(async () => {
  // TODO: Implementar limpeza de dados de teste
});

// Configurar timeout global para testes
jest.setTimeout(30000);