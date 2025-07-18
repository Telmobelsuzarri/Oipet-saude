const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OiPet Saúde - Teste</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
              background: linear-gradient(to right, #4facfe, #00f2fe);
            }
            .container { 
              text-align: center; 
              background: white; 
              padding: 2rem; 
              border-radius: 10px; 
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            button {
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin-top: 1rem;
            }
            button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🐾 OiPet Saúde</h1>
            <p>Servidor de teste funcionando!</p>
            <p>Status: <strong style="color: green;">ONLINE</strong></p>
            <button onclick="alert('Teste de JavaScript funcionando!')">
              Testar JavaScript
            </button>
            <div style="margin-top: 1rem;">
              <a href="http://localhost:3002/api-test" style="color: #007bff;">
                Testar API Backend
              </a>
            </div>
          </div>
        </body>
      </html>
    `);
  } else if (req.url === '/api-test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      message: 'Servidor teste funcionando',
      timestamp: new Date().toISOString(),
      backend: 'https://oipet-saude-production.up.railway.app'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Página não encontrada</h1>');
  }
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`🚀 Servidor teste rodando em http://localhost:${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`🔧 API Test: http://localhost:${PORT}/api-test`);
});