#!/usr/bin/env node

const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const testConnections = [
  {
    name: "MongoDB Atlas",
    url: "mongodb+srv://oipet-user:oipet2025secure@oipet-saude.xxxxx.mongodb.net/oipet-saude?retryWrites=true&w=majority",
    description: "☁️  MongoDB Atlas (Cloud) - Requer configuração manual do cluster"
  },
  {
    name: "MongoDB Local (Docker)",
    url: "mongodb://oipet:oipet2025@localhost:27017/oipet-saude?authSource=admin",
    description: "🐳 MongoDB via Docker - Execute: docker-compose up -d mongodb"
  },
  {
    name: "MongoDB Local (Simples)",
    url: "mongodb://localhost:27017/oipet-saude",
    description: "💻 MongoDB local sem autenticação"
  }
];

async function testConnection(config) {
  console.log(`\n🔄 Testando: ${config.name}`);
  console.log(`📝 ${config.description}`);
  console.log(`🔗 URL: ${config.url.replace(/:[^:@]+@/, ':****@')}`);
  
  try {
    await mongoose.connect(config.url, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    console.log(`✅ ${config.name}: Conexão bem-sucedida!`);
    
    // Testar uma operação básica
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Collections encontradas: ${collections.length}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log(`❌ ${config.name}: Falhou`);
    console.log(`   Erro: ${error.message}`);
    return false;
  }
}

async function setupDatabase() {
  console.log('🚀 OiPet Saúde - Setup do Banco de Dados\n');
  
  // Testar todas as opções
  for (const config of testConnections) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 Configuração recomendada encontrada!`);
      console.log(`\n📝 Para usar esta configuração, atualize seu .env:`);
      console.log(`MONGODB_URI=${config.url}`);
      
      rl.question('\n❓ Deseja atualizar o .env automaticamente? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          updateEnvFile(config.url);
        } else {
          console.log('\n✋ OK, atualize manualmente o arquivo .env');
        }
        rl.close();
        process.exit(0);
      });
      return;
    }
  }
  
  console.log('\n⚠️  Nenhuma conexão funcionou. Opções:');
  console.log('\n1. 🏗️  Para MongoDB local via Docker:');
  console.log('   docker-compose up -d mongodb');
  console.log('\n2. ☁️  Para MongoDB Atlas:');
  console.log('   - Crie cluster em https://cloud.mongodb.com');
  console.log('   - Configure Network Access (0.0.0.0/0)');
  console.log('   - Crie usuário: oipet-user / oipet2025secure');
  console.log('   - Atualize a URL no arquivo .env');
  
  rl.close();
  process.exit(1);
}

function updateEnvFile(mongoUrl) {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Atualizar ou adicionar MONGODB_URI
    if (envContent.includes('MONGODB_URI=')) {
      envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI=${mongoUrl}`);
    } else {
      envContent += `\nMONGODB_URI=${mongoUrl}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Arquivo .env atualizado com sucesso!');
    console.log('\n🚀 Execute agora: npm run dev');
  } catch (error) {
    console.log(`\n❌ Erro ao atualizar .env: ${error.message}`);
    console.log(`\n📝 Atualize manualmente: MONGODB_URI=${mongoUrl}`);
  }
}

// Executar setup
setupDatabase().catch(console.error);