/**
 * Script para criar usuário de teste no banco de dados
 * Execute com: node scripts/create-test-user.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar ao MongoDB (use a mesma URI do production)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://oipet-user:oipet2025secure@cluster0.5vmh6ki.mongodb.net/oipet-saude?retryWrites=true&w=majority&appName=Cluster0';

// Schema do usuário
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUsers() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Criar usuário normal de teste
    const testUser = {
      name: 'Usuário Teste',
      email: 'teste@oipet.com',
      password: await bcrypt.hash('teste123', 10),
      isEmailVerified: true,
      isAdmin: false
    };

    // Criar usuário admin
    const adminUser = {
      name: 'Admin OiPet',
      email: 'admin@oipet.com',
      password: await bcrypt.hash('admin2025', 10),
      isEmailVerified: true,
      isAdmin: true
    };

    // Verificar se já existem
    const existingTest = await User.findOne({ email: testUser.email });
    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (!existingTest) {
      await User.create(testUser);
      console.log('✅ Usuário de teste criado:', testUser.email);
    } else {
      console.log('⚠️ Usuário de teste já existe:', testUser.email);
    }

    if (!existingAdmin) {
      await User.create(adminUser);
      console.log('✅ Usuário admin criado:', adminUser.email);
    } else {
      console.log('⚠️ Usuário admin já existe:', adminUser.email);
    }

    console.log('\n📝 Credenciais de acesso:');
    console.log('----------------------------');
    console.log('Usuário Normal:');
    console.log('Email: teste@oipet.com');
    console.log('Senha: teste123');
    console.log('');
    console.log('Usuário Admin:');
    console.log('Email: admin@oipet.com');
    console.log('Senha: admin2025');
    console.log('----------------------------\n');

    await mongoose.connection.close();
    console.log('✅ Conexão fechada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

createTestUsers();