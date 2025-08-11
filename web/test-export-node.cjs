// Teste das bibliotecas de exportação no ambiente Node.js
const fs = require('fs');
const path = require('path');

console.log('🧪 OiPet - Teste de Bibliotecas de Exportação');
console.log('============================================\n');

// Função para verificar se um pacote está instalado
function checkPackage(packageName) {
    try {
        const packagePath = path.join(__dirname, 'node_modules', packageName);
        const exists = fs.existsSync(packagePath);
        
        if (exists) {
            const packageJson = require(path.join(packagePath, 'package.json'));
            console.log(`✅ ${packageName} v${packageJson.version} - INSTALADO`);
            return true;
        } else {
            console.log(`❌ ${packageName} - NÃO ENCONTRADO`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${packageName} - ERRO: ${error.message}`);
        return false;
    }
}

// Função para testar importação
function testImport(packageName) {
    try {
        const pkg = require(packageName);
        console.log(`✅ ${packageName} - IMPORTAÇÃO OK`);
        return pkg;
    } catch (error) {
        console.log(`❌ ${packageName} - ERRO NA IMPORTAÇÃO: ${error.message}`);
        return null;
    }
}

console.log('📦 Verificando pacotes instalados:');
console.log('----------------------------------');

const packages = ['jspdf', 'jspdf-autotable', 'xlsx'];
const installedPackages = {};

packages.forEach(pkg => {
    installedPackages[pkg] = checkPackage(pkg);
});

console.log('\n📥 Testando importações:');
console.log('------------------------');

// Teste de importação jsPDF
const jsPDF = testImport('jspdf');

// Teste de importação jspdf-autotable
const autoTable = testImport('jspdf-autotable');

// Teste de importação XLSX
const XLSX = testImport('xlsx');

console.log('\n🔍 Verificando dependências no package.json:');
console.log('---------------------------------------------');

try {
    const packageJson = require('./package.json');
    const deps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};
    
    packages.forEach(pkg => {
        if (deps[pkg]) {
            console.log(`✅ ${pkg} v${deps[pkg]} - PRODUCTION DEPENDENCY`);
        } else if (devDeps[pkg]) {
            console.log(`✅ ${pkg} v${devDeps[pkg]} - DEV DEPENDENCY`);
        } else {
            console.log(`❌ ${pkg} - NÃO LISTADO NO PACKAGE.JSON`);
        }
    });
} catch (error) {
    console.log(`❌ Erro ao ler package.json: ${error.message}`);
}

console.log('\n🎯 Verificando estrutura de node_modules:');
console.log('------------------------------------------');

const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('✅ Pasta node_modules existe');
    
    packages.forEach(pkg => {
        const pkgPath = path.join(nodeModulesPath, pkg);
        if (fs.existsSync(pkgPath)) {
            const files = fs.readdirSync(pkgPath);
            console.log(`✅ ${pkg}/ - ${files.length} arquivos`);
        } else {
            console.log(`❌ ${pkg}/ - PASTA NÃO ENCONTRADA`);
        }
    });
} else {
    console.log('❌ Pasta node_modules não existe');
}

console.log('\n🎮 Verificando cache do Vite:');
console.log('-----------------------------');

const viteCachePath = path.join(__dirname, 'node_modules', '.vite');
if (fs.existsSync(viteCachePath)) {
    console.log('✅ Cache do Vite existe');
    
    const depsPath = path.join(viteCachePath, 'deps');
    if (fs.existsSync(depsPath)) {
        console.log('✅ Pasta deps do Vite existe');
        
        try {
            const deps = fs.readdirSync(depsPath);
            const relevantDeps = deps.filter(dep => 
                dep.includes('jspdf') || 
                dep.includes('xlsx') || 
                dep.includes('autotable')
            );
            
            if (relevantDeps.length > 0) {
                console.log('📦 Dependências processadas pelo Vite:');
                relevantDeps.forEach(dep => {
                    console.log(`  - ${dep}`);
                });
            } else {
                console.log('⚠️ Nenhuma dependência de exportação processada pelo Vite');
            }
        } catch (error) {
            console.log(`⚠️ Erro ao ler cache do Vite: ${error.message}`);
        }
    } else {
        console.log('⚠️ Pasta deps do Vite não existe');
    }
} else {
    console.log('⚠️ Cache do Vite não existe');
}

console.log('\n📊 Resumo do Teste:');
console.log('====================');

const totalPackages = packages.length;
const installedCount = Object.values(installedPackages).filter(Boolean).length;

console.log(`Pacotes verificados: ${totalPackages}`);
console.log(`Pacotes instalados: ${installedCount}`);
console.log(`Taxa de sucesso: ${((installedCount / totalPackages) * 100).toFixed(1)}%`);

if (installedCount === totalPackages) {
    console.log('\n🎉 SUCESSO: Todas as bibliotecas estão instaladas!');
    console.log('💡 Problema pode estar na importação/execução no navegador');
    console.log('🔧 Sugestões:');
    console.log('   1. Limpar cache do navegador');
    console.log('   2. Reiniciar servidor de desenvolvimento');
    console.log('   3. Verificar console do navegador para erros');
    console.log('   4. Testar com arquivo HTML direto');
} else {
    console.log('\n❌ PROBLEMA: Algumas bibliotecas não estão instaladas');
    console.log('🔧 Execute: npm install jspdf jspdf-autotable xlsx');
}

console.log('\n🌐 Teste HTML disponível em:');
console.log(`   file://${path.join(__dirname, 'test-export-debug.html')}`);
console.log('   Abra este arquivo no navegador para teste direto');