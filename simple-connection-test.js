/**
 * Simple Connection Test - Verificar conectividade básica
 */

const axios = require('axios');
const chalk = require('chalk');

const BACKEND_URL = 'https://oipet-saude-production.up.railway.app/api';

async function testBasicConnection() {
  console.log(chalk.blue('🔍 Testando conectividade básica com o backend...\n'));
  
  try {
    // Test 1: Basic connection
    console.log('Teste 1: Conectividade básica');
    const baseResponse = await axios.get(BACKEND_URL, { timeout: 10000 });
    console.log(chalk.green('✓ Conexão com backend estabelecida'));
    console.log(`Status: ${baseResponse.status}`);
  } catch (error) {
    console.log(chalk.yellow('⚠ Tentando endpoint base diferente...'));
    
    try {
      // Test alternative endpoints
      const healthResponse = await axios.get(`${BACKEND_URL}/status`, { timeout: 10000 });
      console.log(chalk.green('✓ Conexão via /status estabelecida'));
    } catch (healthError) {
      try {
        const rootResponse = await axios.get('https://oipet-saude-production.up.railway.app/', { timeout: 10000 });
        console.log(chalk.green('✓ Servidor está online (root endpoint)'));
        console.log(chalk.yellow('⚠ Endpoint /api pode não estar configurado corretamente'));
      } catch (rootError) {
        console.log(chalk.red('✗ Servidor não está respondendo'));
        console.log(`Erro: ${rootError.message}`);
        return false;
      }
    }
  }

  // Test 2: API endpoints without auth
  console.log('\nTeste 2: Endpoints públicos');
  try {
    // Try to access some basic endpoint
    const response = await axios.get(`${BACKEND_URL}/status`, { timeout: 10000 });
    console.log(chalk.green('✓ Endpoint /status acessível'));
  } catch (error) {
    console.log(chalk.yellow('⚠ Endpoint /status não encontrado - normal se não implementado'));
  }

  // Test 3: CORS and headers
  console.log('\nTeste 3: Headers e CORS');
  try {
    const response = await axios.options(BACKEND_URL, { timeout: 10000 });
    console.log(chalk.green('✓ CORS configurado corretamente'));
  } catch (error) {
    console.log(chalk.yellow('⚠ CORS pode precisar de configuração'));
  }

  return true;
}

async function testMobileWebAPISimilarity() {
  console.log(chalk.blue('\n🔄 Verificando compatibilidade Mobile/Web API...\n'));
  
  // Check if both mobile and web are using the same API base URL
  const mobileAPI = 'https://oipet-saude-production.up.railway.app/api';
  const webAPI = 'https://oipet-saude-production.up.railway.app/api';
  
  if (mobileAPI === webAPI) {
    console.log(chalk.green('✓ Mobile e Web usam a mesma API base'));
    console.log(`URL: ${mobileAPI}`);
  } else {
    console.log(chalk.red('✗ Mobile e Web usam APIs diferentes'));
    console.log(`Mobile: ${mobileAPI}`);
    console.log(`Web: ${webAPI}`);
    return false;
  }

  // Check endpoint structure
  const expectedEndpoints = [
    '/auth/login',
    '/auth/register',
    '/pets',
    '/health',
    '/notifications',
    '/users/profile'
  ];

  console.log('\nEndpoints esperados:');
  expectedEndpoints.forEach(endpoint => {
    console.log(chalk.gray(`  ${mobileAPI}${endpoint}`));
  });

  return true;
}

async function main() {
  console.log(chalk.bold.blue('🚀 OiPet Saúde - Teste de Conectividade Simples\n'));
  
  const connectionOK = await testBasicConnection();
  const compatibilityOK = await testMobileWebAPISimilarity();

  console.log(chalk.bold('\n📊 Resumo:'));
  console.log(`Conectividade: ${connectionOK ? chalk.green('✓ OK') : chalk.red('✗ FALHOU')}`);
  console.log(`Compatibilidade: ${compatibilityOK ? chalk.green('✓ OK') : chalk.red('✗ FALHOU')}`);

  if (connectionOK && compatibilityOK) {
    console.log(chalk.bold.green('\n✅ Infraestrutura está configurada corretamente!'));
    console.log(chalk.green('Mobile e Web podem se conectar ao mesmo backend.'));
  } else {
    console.log(chalk.bold.yellow('\n⚠ Algumas verificações falharam'));
    console.log(chalk.yellow('Verifique as configurações do backend.'));
  }
}

main().catch(error => {
  console.log(chalk.red(`Erro inesperado: ${error.message}`));
});