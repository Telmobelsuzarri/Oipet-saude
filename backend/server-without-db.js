const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'OiPet Saúde API - Running without database',
    timestamp: new Date().toISOString(),
    endpoints: {
      test: 'GET /',
      health: 'GET /health',
      mockPets: 'GET /api/pets',
      mockUser: 'GET /api/user'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OiPet Saúde API',
    database: 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Mock data para teste
const mockPets = [
  {
    _id: '1',
    name: 'Rex',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 25
  },
  {
    _id: '2',
    name: 'Mia',
    species: 'cat',
    breed: 'Siamês',
    age: 2,
    weight: 4
  }
];

const mockUser = {
  _id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  pets: mockPets
};

// Rotas mock
app.get('/api/pets', (req, res) => {
  res.json({
    success: true,
    data: mockPets
  });
});

app.get('/api/user', (req, res) => {
  res.json({
    success: true,
    data: mockUser
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
🚀 OiPet Saúde API (Mock Mode)
📍 Server running at: http://localhost:${PORT}
⚠️  Database: Not connected (using mock data)
🔧 Mode: Development

Available endpoints:
- GET http://localhost:${PORT}/
- GET http://localhost:${PORT}/health
- GET http://localhost:${PORT}/api/pets
- GET http://localhost:${PORT}/api/user
  `);
});