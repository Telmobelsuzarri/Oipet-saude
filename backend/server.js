#!/usr/bin/env node

/**
 * OiPet Saúde Backend - Production Server
 * Simple Node.js server for Railway deployment
 */

console.log('🚀 Starting OiPet Saúde Backend...');

// Load environment variables
require('dotenv').config();

// Setup module aliases for TypeScript paths
const moduleAlias = require('module-alias');
const path = require('path');

// Register aliases
moduleAlias.addAliases({
  '@': path.join(__dirname, 'src'),
  '@/config': path.join(__dirname, 'src/config'),
  '@/controllers': path.join(__dirname, 'src/controllers'),
  '@/middleware': path.join(__dirname, 'src/middleware'),
  '@/models': path.join(__dirname, 'src/models'),
  '@/routes': path.join(__dirname, 'src/routes'),
  '@/services': path.join(__dirname, 'src/services'),
  '@/utils': path.join(__dirname, 'src/utils'),
  '@/types': path.join(__dirname, 'src/types')
});

// Register ts-node if in development
if (process.env.NODE_ENV !== 'production') {
  require('ts-node').register({
    transpileOnly: true,
    files: true,
    compilerOptions: {
      allowJs: true
    }
  });
  require('tsconfig-paths/register');
}

// Try to start the TypeScript server
try {
  console.log('📦 Loading TypeScript server...');
  
  // Register ts-node for production
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      target: 'es2020',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      strict: false,
      noImplicitAny: false,
      resolveJsonModule: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true
    }
  });
  
  require('tsconfig-paths/register');
  require('./src/index.ts');
} catch (error) {
  console.error('❌ Failed to start TypeScript server:', error.message);
  console.log('🔄 Starting fallback Express server...');
  
  // Fallback to basic Express server
  const express = require('express');
  const cors = require('cors');
  
  const app = express();
  const PORT = parseInt(process.env.PORT || '3001', 10);
  
  // Basic middlewares
  app.use(cors());
  app.use(express.json());
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      mode: 'fallback',
      service: 'OiPet Saúde Backend'
    });
  });
  
  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'OiPet Saúde API',
      status: 'running',
      endpoints: {
        health: '/health',
        api: '/api/*',
        docs: '/api-docs'
      }
    });
  });
  
  // Basic error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: err.message
    });
  });
  
  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Fallback server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  });
}