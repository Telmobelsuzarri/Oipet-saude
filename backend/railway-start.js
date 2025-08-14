/**
 * Railway Start Script
 * Garante que o servidor inicie corretamente no Railway
 */

const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Railway Start Script');
console.log('📁 Current directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Se estivermos na raiz, vamos para o backend
if (!process.cwd().endsWith('backend')) {
  console.log('📂 Changing to backend directory...');
  process.chdir(path.join(__dirname));
}

console.log('📁 Final directory:', process.cwd());
console.log('🔍 Checking for files...');

const fs = require('fs');

// Verificar arquivos importantes
const files = ['tsconfig.json', 'server-production.js', 'package.json'];
files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} NOT FOUND`);
  }
});

// Iniciar o servidor de produção
console.log('\n🚀 Starting production server...\n');
require('./server-production.js');