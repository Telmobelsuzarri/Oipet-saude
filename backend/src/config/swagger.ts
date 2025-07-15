/**
 * Configuração do Swagger para documentação da API
 */

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OiPet Saúde API',
      version: '1.0.0',
      description: 'API para o aplicativo OiPet Saúde - Gestão de saúde e alimentação para pets',
      contact: {
        name: 'Equipe OiPet',
        email: 'dev@oipet.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` 
          : `http://localhost:${process.env.PORT || 3001}`,
        description: process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            isAdmin: { type: 'boolean' },
            isEmailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Pet: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            name: { type: 'string' },
            species: { type: 'string', enum: ['dog', 'cat', 'other'] },
            breed: { type: 'string' },
            birthDate: { type: 'string', format: 'date' },
            weight: { type: 'number' },
            height: { type: 'number' },
            gender: { type: 'string', enum: ['male', 'female'] },
            isNeutered: { type: 'boolean' },
            avatar: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        HealthRecord: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            petId: { type: 'string' },
            date: { type: 'string', format: 'date' },
            weight: { type: 'number' },
            height: { type: 'number' },
            activity: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                duration: { type: 'number' },
                intensity: { type: 'string', enum: ['low', 'medium', 'high'] },
              },
            },
            calories: { type: 'number' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Caminhos para os arquivos com documentação
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'OiPet Saúde API',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      theme: 'dark',
      persistAuthorization: true,
    },
  }));
  
  // Endpoint para obter specs em JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;