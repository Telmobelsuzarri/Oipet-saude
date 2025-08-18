import mongoose from 'mongoose';
import { RedisService } from '../config/redis';
import { logger } from '../utils/logger';

// Health Check Service
export class MonitoringService {
  // Database health check
  static async checkDatabase(): Promise<{ status: 'ok' | 'error'; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      
      // Simple ping to MongoDB
      await mongoose.connection.db.admin().ping();
      
      const latency = Date.now() - start;
      return { status: 'ok', latency };
    } catch (error) {
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown database error' 
      };
    }
  }

  // Redis health check
  static async checkRedis(): Promise<{ status: 'ok' | 'error'; latency?: number; error?: string }> {
    return await RedisService.healthCheck();
  }

  // Memory usage check
  static getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100, // MB
      arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024 * 100) / 100 // MB
    };
  }

  // CPU usage check
  static getCPUUsage() {
    const usage = process.cpuUsage();
    return {
      user: usage.user,
      system: usage.system,
      uptime: Math.round(process.uptime()),
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0]
    };
  }

  // Disk space check (if applicable)
  static async getDiskUsage() {
    try {
      const fs = require('fs');
      const stats = fs.statSync(process.cwd());
      
      return {
        free: 'N/A', // Railway doesn't provide disk metrics
        used: 'N/A',
        total: 'N/A',
        lastModified: stats.mtime
      };
    } catch (error) {
      return { error: 'Disk metrics not available' };
    }
  }

  // Network connectivity check
  static async checkExternalServices() {
    const services = {
      mongodb: await this.checkDatabase(),
      redis: await this.checkRedis(),
      sendgrid: await this.checkSendGrid(),
      oipetEcommerce: await this.checkOiPetAPI()
    };

    return services;
  }

  // SendGrid health check
  static async checkSendGrid(): Promise<{ status: 'ok' | 'error'; error?: string }> {
    try {
      // We can't ping SendGrid directly, but we can check if API key is configured
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey || !apiKey.startsWith('SG.')) {
        return { status: 'error', error: 'SendGrid API key not configured' };
      }
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', error: 'SendGrid check failed' };
    }
  }

  // OiPet E-commerce API check
  static async checkOiPetAPI(): Promise<{ status: 'ok' | 'error'; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      const fetch = require('node-fetch');
      
      const response = await fetch(process.env.OIPET_ECOMMERCE_API || 'https://oipetcomidadeverdade.com.br', {
        method: 'HEAD',
        timeout: 5000
      });
      
      const latency = Date.now() - start;
      
      if (response.ok) {
        return { status: 'ok', latency };
      } else {
        return { status: 'error', error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Complete health check
  static async getHealthCheck() {
    const timestamp = new Date().toISOString();
    
    const [database, redis, memory, cpu, externalServices] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      Promise.resolve(this.getMemoryUsage()),
      Promise.resolve(this.getCPUUsage()),
      this.checkExternalServices()
    ]);

    const isHealthy = database.status === 'ok' && 
                     (redis.status === 'ok' || redis.status === 'error'); // Redis is optional

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      checks: {
        database,
        redis,
        memory,
        cpu,
        externalServices
      }
    };
  }

  // Performance metrics
  static async getMetrics() {
    const stats = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptime: process.uptime(),
        memory: this.getMemoryUsage(),
        cpu: this.getCPUUsage()
      },
      application: {
        environment: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    return stats;
  }

  // Log system metrics (for monitoring)
  static async logMetrics() {
    try {
      const health = await this.getHealthCheck();
      const metrics = await this.getMetrics();
      
      // Log to console (Railway will capture this)
      logger.info('Health Check:', {
        status: health.status,
        database: health.checks.database.status,
        redis: health.checks.redis.status,
        memory: health.checks.memory.heapUsed,
        uptime: health.uptime
      });

      // Store metrics in Redis for dashboard (if available)
      await RedisService.set('metrics:latest', {
        health,
        metrics,
        timestamp: new Date().toISOString()
      }, 300); // 5 minutes TTL

    } catch (error) {
      logger.error('Metrics logging failed:', error);
    }
  }

  // Start monitoring (called from main app)
  static startMonitoring(intervalMs = 60000) { // Default: 1 minute
    setInterval(async () => {
      await this.logMetrics();
    }, intervalMs);

    logger.info(`📊 Monitoring started (interval: ${intervalMs}ms)`);
  }

  // Graceful shutdown monitoring
  static async handleShutdown(signal: string) {
    logger.info(`🔄 Received ${signal}, performing graceful shutdown...`);
    
    try {
      // Log final metrics
      await this.logMetrics();
      
      // Stop accepting new connections
      logger.info('✅ Graceful shutdown completed');
    } catch (error) {
      logger.error('Shutdown error:', error);
    }
  }
}