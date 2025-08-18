import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Redis Client Configuration
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    commandTimeout: 5000,
    reconnectRetryDelay: 2000,
  },
  retryDelayOnFailover: 100,
  enableAutoPipelining: true,
});

// Redis Connection Events
redisClient.on('connect', () => {
  logger.info('🔗 Redis: Conectando...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis: Conectado e pronto');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis Error:', err);
});

redisClient.on('end', () => {
  logger.warn('⚠️ Redis: Conexão encerrada');
});

redisClient.on('reconnecting', () => {
  logger.info('🔄 Redis: Reconectando...');
});

// Initialize Redis Connection
export const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      logger.info('✅ Redis: Conectado com sucesso');
    }
  } catch (error) {
    logger.error('❌ Redis: Falha na conexão:', error);
    
    // Graceful fallback - app continues without Redis
    logger.warn('⚠️ Redis: Aplicação funcionará sem cache');
  }
};

// Redis Helper Functions
export class RedisService {
  // Cache Operations
  static async set(key: string, value: string | object, ttl = 3600): Promise<boolean> {
    try {
      if (!redisClient.isOpen) return false;
      
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await redisClient.setEx(key, ttl, serializedValue);
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  static async get(key: string): Promise<string | object | null> {
    try {
      if (!redisClient.isOpen) return null;
      
      const value = await redisClient.get(key);
      if (!value) return null;

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      if (!redisClient.isOpen) return false;
      
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      if (!redisClient.isOpen) return false;
      
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Session Operations
  static async setSession(sessionId: string, data: object, ttl = 86400): Promise<boolean> {
    return this.set(`session:${sessionId}`, data, ttl);
  }

  static async getSession(sessionId: string): Promise<object | null> {
    return this.get(`session:${sessionId}`) as Promise<object | null>;
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    return this.del(`session:${sessionId}`);
  }

  // Rate Limiting
  static async incrementRateLimit(key: string, window = 900, limit = 100): Promise<{ count: number; remaining: number; reset: number }> {
    try {
      if (!redisClient.isOpen) {
        return { count: 1, remaining: limit - 1, reset: Date.now() + window * 1000 };
      }

      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, window);
      }

      const ttl = await redisClient.ttl(key);
      const reset = Date.now() + ttl * 1000;

      return {
        count: current,
        remaining: Math.max(0, limit - current),
        reset
      };
    } catch (error) {
      logger.error('Redis Rate Limit error:', error);
      return { count: 1, remaining: limit - 1, reset: Date.now() + window * 1000 };
    }
  }

  // Cache Invalidation
  static async invalidatePattern(pattern: string): Promise<boolean> {
    try {
      if (!redisClient.isOpen) return false;
      
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Redis Pattern Invalidation error:', error);
      return false;
    }
  }

  // Health Check
  static async healthCheck(): Promise<{ status: 'ok' | 'error'; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      await redisClient.ping();
      const latency = Date.now() - start;
      
      return { status: 'ok', latency };
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Graceful Shutdown
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient.isOpen) {
      await redisClient.disconnect();
      logger.info('✅ Redis: Desconectado com sucesso');
    }
  } catch (error) {
    logger.error('❌ Redis: Erro ao desconectar:', error);
  }
};