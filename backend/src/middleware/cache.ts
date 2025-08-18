import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../config/redis';
import { logger } from '../utils/logger';

// Cache Middleware
export const cacheMiddleware = (ttl = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = `cache:${req.originalUrl}:${JSON.stringify(req.query)}`;

    try {
      // Try to get from cache
      const cachedData = await RedisService.get(cacheKey);
      
      if (cachedData) {
        logger.info(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Cache miss - store the original json method
      const originalJson = res.json;
      
      res.json = function(data: any) {
        // Cache the response
        RedisService.set(cacheKey, data, ttl).catch(err => {
          logger.error('Cache SET error:', err);
        });
        
        logger.info(`📦 Cache MISS: ${cacheKey} - Cached for ${ttl}s`);
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache Invalidation Middleware
export const invalidateCacheMiddleware = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods
    const invalidateCache = async () => {
      for (const pattern of patterns) {
        try {
          await RedisService.invalidatePattern(pattern);
          logger.info(`🗑️ Cache invalidated: ${pattern}`);
        } catch (error) {
          logger.error(`Cache invalidation error for ${pattern}:`, error);
        }
      }
    };

    res.json = function(data: any) {
      invalidateCache();
      return originalJson.call(this, data);
    };

    res.send = function(data: any) {
      invalidateCache();
      return originalSend.call(this, data);
    };

    next();
  };
};

// User-specific cache invalidation
export const invalidateUserCache = (userId: string) => {
  return invalidateCacheMiddleware([
    `cache:/api/users/${userId}*`,
    `cache:/api/pets*user=${userId}*`,
    `cache:/api/health*user=${userId}*`
  ]);
};

// Pet-specific cache invalidation
export const invalidatePetCache = (petId: string) => {
  return invalidateCacheMiddleware([
    `cache:/api/pets/${petId}*`,
    `cache:/api/pets/${petId}/health*`,
    `cache:/api/health*pet=${petId}*`
  ]);
};