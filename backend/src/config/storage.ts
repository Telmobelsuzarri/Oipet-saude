import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { logger } from '../utils/logger';

// Storage Configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads';
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760'); // 10MB
const ALLOWED_TYPES = process.env.ALLOWED_FILE_TYPES?.split(',') || [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info(`📁 Created upload directory: ${UPLOAD_DIR}`);
}

// Create subdirectories
const subdirs = ['pets', 'users', 'food-scans', 'temp'];
subdirs.forEach(subdir => {
  const fullPath = path.join(UPLOAD_DIR, subdir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logger.info(`📁 Created subdirectory: ${fullPath}`);
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = UPLOAD_DIR;
    
    // Determine subdirectory based on route
    if (req.path.includes('/pets')) {
      uploadPath = path.join(UPLOAD_DIR, 'pets');
    } else if (req.path.includes('/users')) {
      uploadPath = path.join(UPLOAD_DIR, 'users');
    } else if (req.path.includes('/food')) {
      uploadPath = path.join(UPLOAD_DIR, 'food-scans');
    } else {
      uploadPath = path.join(UPLOAD_DIR, 'temp');
    }
    
    cb(null, uploadPath);
  },
  
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    
    const filename = `${name}-${timestamp}-${random}${ext}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5 // Maximum 5 files per request
  }
});

// Storage Service
export class StorageService {
  // Save file metadata
  static async saveFileMetadata(file: Express.Multer.File, userId: string, entityId?: string) {
    const metadata = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      userId,
      entityId,
      uploadedAt: new Date()
    };
    
    logger.info('📁 File uploaded:', metadata);
    return metadata;
  }

  // Delete file
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`🗑️ File deleted: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('File deletion error:', error);
      return false;
    }
  }

  // Get file URL
  static getFileUrl(filename: string, category = 'temp'): string {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${category}/${filename}`;
  }

  // Clean temp files (older than 24h)
  static async cleanTempFiles(): Promise<void> {
    try {
      const tempDir = path.join(UPLOAD_DIR, 'temp');
      const files = fs.readdirSync(tempDir);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < oneDayAgo) {
          fs.unlinkSync(filePath);
          logger.info(`🧹 Cleaned temp file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Temp file cleanup error:', error);
    }
  }

  // Get storage info
  static getStorageInfo() {
    try {
      const stats = fs.statSync(UPLOAD_DIR);
      return {
        uploadDir: UPLOAD_DIR,
        exists: fs.existsSync(UPLOAD_DIR),
        maxFileSize: MAX_FILE_SIZE,
        allowedTypes: ALLOWED_TYPES,
        createdAt: stats.birthtime
      };
    } catch (error) {
      logger.error('Storage info error:', error);
      return null;
    }
  }
}

// Serve static files middleware
export const serveUploads = (app: any) => {
  const express = require('express');
  
  app.use('/uploads', express.static(UPLOAD_DIR, {
    maxAge: '1h',
    setHeaders: (res: any, path: string) => {
      // Security headers for uploaded files
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      
      // Only allow images to be displayed
      if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        res.setHeader('Content-Disposition', 'inline');
      } else {
        res.setHeader('Content-Disposition', 'attachment');
      }
    }
  }));
};

// Schedule temp cleanup (every 6 hours)
setInterval(() => {
  StorageService.cleanTempFiles();
}, 6 * 60 * 60 * 1000);