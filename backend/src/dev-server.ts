/**
 * Servidor de desenvolvimento com MongoDB em memória
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';

async function startDevelopmentServer() {
  console.log('🚀 Iniciando servidor de desenvolvimento...');
  
  // Iniciar MongoDB em memória
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'oipet-saude'
    }
  });

  const uri = mongod.getUri();
  console.log('🗄️  MongoDB em memória iniciado em:', uri);

  // Definir variável de ambiente
  process.env.MONGODB_URI = uri;

  // Iniciar servidor principal
  const server = spawn('ts-node', ['-r', 'tsconfig-paths/register', 'src/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      MONGODB_URI: uri
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down development server...');
    server.kill();
    await mongod.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down development server...');
    server.kill();
    await mongod.stop();
    process.exit(0);
  });
}

startDevelopmentServer().catch(console.error);