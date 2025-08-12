const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting simple server...');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'OiPet Saúde API - Simple Server',
    status: 'running',
    port: PORT,
    env: process.env.NODE_ENV || 'not set',
    mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mode: 'simple'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});