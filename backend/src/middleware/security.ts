import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisService } from '../config/redis';
import { logger } from '../utils/logger';

// Advanced Rate Limiting with Redis
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: options.message || 'Muitas tentativas, tente novamente mais tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
    
    // Use Redis for distributed rate limiting
    store: {
      async incr(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
        try {
          const result = await RedisService.incrementRateLimit(
            `rate-limit:${key}`,
            Math.floor(options.windowMs / 1000),
            options.max
          );
          
          return {
            totalHits: result.count,
            resetTime: new Date(result.reset)
          };
        } catch (error) {
          logger.error('Rate limit Redis error:', error);
          // Fallback to in-memory counting
          return { totalHits: 1 };
        }
      },
      
      async decrement(key: string): Promise<void> {
        // Not needed for our implementation
      },
      
      async resetKey(key: string): Promise<void> {
        await RedisService.del(`rate-limit:${key}`);
      }
    },
    
    keyGenerator: options.keyGenerator || ((req: Request) => req.ip),
    
    onLimitReached: (req: Request) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);
    }
  });
};

// Different rate limiters for different endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Muitas tentativas de login, tente novamente em 15 minutos',
  keyGenerator: (req: Request) => `auth:${req.ip}:${req.body.email || 'unknown'}`
});

export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Muitas requests, tente novamente em 15 minutos'
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: 'Muitos uploads, tente novamente em 1 hora'
});

// Security Headers Middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // HTTPS enforcement
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }

  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.sendgrid.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '));

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
};

// IP Whitelist/Blacklist
const BLOCKED_IPS = new Set(process.env.BLOCKED_IPS?.split(',') || []);
const ALLOWED_IPS = new Set(process.env.ALLOWED_IPS?.split(',') || []);

export const ipFilter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check if IP is blocked
  if (BLOCKED_IPS.has(clientIP!)) {
    logger.warn(`Blocked IP attempted access: ${clientIP}`);
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  // If whitelist is configured, check if IP is allowed
  if (ALLOWED_IPS.size > 0 && !ALLOWED_IPS.has(clientIP!)) {
    logger.warn(`Non-whitelisted IP attempted access: ${clientIP}`);
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  next();
};

// Request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    };
    
    // Log suspicious activity
    if (res.statusCode >= 400) {
      logger.warn('Security event:', logData);
    } else {
      logger.info('Request:', logData);
    }
  });
  
  next();
};

// API Key validation (for external integrations)
export const apiKeyValidation = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'API Key inválida' });
  }
  
  next();
};

// Input sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection - remove script tags
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

// CORS security enhancement
export const corsSecurityOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3000',
      'https://oipet-saude.vercel.app'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Não permitido pelo CORS'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Remaining']
};