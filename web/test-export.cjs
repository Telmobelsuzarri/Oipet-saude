// Script Node.js para testar as bibliotecas de exportação
const fs = require('fs')
const path = require('path')

console.log('🧪 Testando bibliotecas de exportação...\n')

// Teste 1: Verificar se os pacotes estão instalados
console.log('1️⃣ Verificando instalação dos pacotes...')

const packagesToCheck = ['jspdf', 'jspdf-autotable', 'xlsx']
let allPackagesInstalled = true

packagesToCheck.forEach(pkg => {
  try {
    const packagePath = path.join(__dirname, 'node_modules', pkg)
    if (fs.existsSync(packagePath)) {
      console.log(`   ✅ ${pkg} - Instalado`)
    } else {
      console.log(`   ❌ ${pkg} - NÃO encontrado`)
      allPackagesInstalled = false
    }
  } catch (error) {
    console.log(`   ❌ ${pkg} - Erro ao verificar: ${error.message}`)
    allPackagesInstalled = false
  }
})

// Teste 2: Verificar package.json
console.log('\n2️⃣ Verificando package.json...')
try {
  const packageJsonPath = path.join(__dirname, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  
  packagesToCheck.forEach(pkg => {
    const version = packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
    if (version) {
      console.log(`   ✅ ${pkg}@${version}`)
    } else {
      console.log(`   ❌ ${pkg} - Não encontrado no package.json`)
    }
  })
} catch (error) {
  console.log(`   ❌ Erro ao ler package.json: ${error.message}`)
}

// Teste 3: Tentar importar as bibliotecas (simulação)
console.log('\n3️⃣ Verificando imports TypeScript...')

const importsToCheck = [
  "import jsPDF from 'jspdf'",
  "import autoTable from 'jspdf-autotable'",
  "import * as XLSX from 'xlsx'"
]

importsToCheck.forEach(imp => {
  console.log(`   📝 ${imp}`)
})

// Teste 4: Verificar se os arquivos de serviço existem
console.log('\n4️⃣ Verificando arquivos de serviço...')

const servicesToCheck = [
  'src/services/exportService.ts',
  'src/services/exportServiceSimple.ts',
  'src/utils/exportTest.ts'
]

servicesToCheck.forEach(service => {
  const servicePath = path.join(__dirname, service)
  if (fs.existsSync(servicePath)) {
    console.log(`   ✅ ${service} - Existe`)
  } else {
    console.log(`   ❌ ${service} - NÃO encontrado`)
  }
})

// Teste 5: Verificar configurações do Vite
console.log('\n5️⃣ Verificando configuração do Vite...')
const viteConfigPath = path.join(__dirname, 'vite.config.ts')
if (fs.existsSync(viteConfigPath)) {
  console.log('   ✅ vite.config.ts encontrado')
  try {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8')
    if (viteConfig.includes('define:')) {
      console.log('   ✅ Configuração define encontrada')
    } else {
      console.log('   ⚠️  Pode precisar de configuração define para compatibility')
    }
  } catch (error) {
    console.log(`   ❌ Erro ao ler vite.config.ts: ${error.message}`)
  }
} else {
  console.log('   ❌ vite.config.ts NÃO encontrado')
}

console.log('\n📊 Resumo dos testes:')
if (allPackagesInstalled) {
  console.log('   ✅ Todos os pacotes estão instalados')
  console.log('   🎯 As bibliotecas devem funcionar no navegador')
  console.log('\n🚀 Próximos passos:')
  console.log('   1. Acesse http://localhost:3000/app/reports/test-export')
  console.log('   2. Clique em "Teste Automatizado Completo"')
  console.log('   3. Abra o Console (F12) para ver logs detalhados')
  console.log('   4. Verifique sua pasta de Downloads')
} else {
  console.log('   ❌ Alguns pacotes não foram encontrados')
  console.log('   🔧 Execute: npm install jspdf jspdf-autotable xlsx')
}

console.log('\n' + '='.repeat(50))