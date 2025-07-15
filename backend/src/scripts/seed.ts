/**
 * Script de seed para dados de teste
 */

import mongoose from 'mongoose';
import { connectDatabase } from '@/config/database';
import { User, Pet, HealthRecord, FoodScan, Notification } from '@/models';
import { logger } from '@/utils/logger';

// Dados de teste
const seedData = {
  users: [
    {
      email: 'admin@oipet.com',
      password: '123456',
      name: 'Admin OiPet',
      phone: '(11) 99999-9999',
      isAdmin: true,
      isEmailVerified: true,
    },
    {
      email: 'joao@email.com',
      password: '123456',
      name: 'João Silva',
      phone: '(11) 98888-8888',
      isEmailVerified: true,
    },
    {
      email: 'maria@email.com',
      password: '123456',
      name: 'Maria Santos',
      phone: '(11) 97777-7777',
      isEmailVerified: true,
    },
  ],
  pets: [
    {
      name: 'Rex',
      species: 'dog' as const,
      breed: 'Golden Retriever',
      birthDate: new Date('2020-03-15'),
      weight: 28.5,
      height: 55,
      gender: 'male' as const,
      isNeutered: true,
    },
    {
      name: 'Luna',
      species: 'cat' as const,
      breed: 'Siamês',
      birthDate: new Date('2021-07-20'),
      weight: 4.2,
      height: 25,
      gender: 'female' as const,
      isNeutered: true,
    },
    {
      name: 'Max',
      species: 'dog' as const,
      breed: 'Labrador',
      birthDate: new Date('2019-11-10'),
      weight: 32.0,
      height: 60,
      gender: 'male' as const,
      isNeutered: false,
    },
  ],
};

async function clearDatabase() {
  logger.info('🗑️  Limpando banco de dados...');
  
  await Promise.all([
    User.deleteMany({}),
    Pet.deleteMany({}),
    HealthRecord.deleteMany({}),
    FoodScan.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  
  logger.info('✅ Banco de dados limpo');
}

async function seedUsers() {
  logger.info('👥 Criando usuários...');
  
  const users = [];
  for (const userData of seedData.users) {
    const user = new User(userData);
    await user.save();
    users.push(user);
    logger.info(`   ✅ Usuário criado: ${user.name} (${user.email})`);
  }
  
  return users;
}

async function seedPets(users: any[]) {
  logger.info('🐕 Criando pets...');
  
  const pets = [];
  for (let i = 0; i < seedData.pets.length; i++) {
    const petData = {
      ...seedData.pets[i],
      userId: users[i % users.length]._id,
    };
    
    const pet = new Pet(petData);
    await pet.save();
    pets.push(pet);
    logger.info(`   ✅ Pet criado: ${pet.name} (${pet.species})`);
  }
  
  return pets;
}

async function seedHealthRecords(pets: any[], users: any[]) {
  logger.info('🏥 Criando registros de saúde...');
  
  const healthRecords = [];
  
  for (const pet of pets) {
    // Criar registros dos últimos 30 dias
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Registro de peso (a cada 5 dias)
      if (day % 5 === 0) {
        const weightRecord = new HealthRecord({
          petId: pet._id,
          date,
          weight: pet.weight + (Math.random() - 0.5) * 2, // Variação de ±1kg
          createdBy: users[0]._id,
          notes: `Pesagem de rotina - dia ${30 - day}`,
        });
        await weightRecord.save();
        healthRecords.push(weightRecord);
      }
      
      // Registro de atividade (diário)
      const activityRecord = new HealthRecord({
        petId: pet._id,
        date,
        activity: {
          type: ['caminhada', 'brincadeira', 'corrida'][Math.floor(Math.random() * 3)],
          duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutos
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          calories: Math.floor(Math.random() * 200) + 100, // 100-300 calorias
        },
        createdBy: users[Math.floor(Math.random() * users.length)]._id,
      });
      await activityRecord.save();
      healthRecords.push(activityRecord);
      
      // Registro de sono (diário)
      const sleepRecord = new HealthRecord({
        petId: pet._id,
        date,
        sleep: {
          duration: Math.random() * 4 + 8, // 8-12 horas
          quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)] as any,
        },
        mood: ['sad', 'neutral', 'happy', 'very_happy'][Math.floor(Math.random() * 4)] as any,
        createdBy: users[Math.floor(Math.random() * users.length)]._id,
      });
      await sleepRecord.save();
      healthRecords.push(sleepRecord);
    }
  }
  
  logger.info(`   ✅ ${healthRecords.length} registros de saúde criados`);
  return healthRecords;
}

async function seedFoodScans(pets: any[], users: any[]) {
  logger.info('🍽️ Criando escaneamentos de alimentos...');
  
  const foodScans = [];
  const foods = [
    {
      name: 'Ração Premium para Cães',
      calories: 380,
      protein: 24,
      carbs: 42,
      fat: 12,
      confidence: 0.95,
    },
    {
      name: 'Petisco Natural de Frango',
      calories: 320,
      protein: 55,
      carbs: 2,
      fat: 8,
      confidence: 0.88,
    },
    {
      name: 'Ração para Gatos Filhotes',
      calories: 420,
      protein: 32,
      carbs: 35,
      fat: 18,
      confidence: 0.92,
    },
  ];
  
  for (const pet of pets) {
    for (let i = 0; i < 10; i++) {
      const food = foods[Math.floor(Math.random() * foods.length)];
      const scanDate = new Date();
      scanDate.setDate(scanDate.getDate() - Math.floor(Math.random() * 30));
      
      const foodScan = new FoodScan({
        petId: pet._id,
        userId: users[Math.floor(Math.random() * users.length)]._id,
        imageUrl: `https://example.com/food-images/${Math.floor(Math.random() * 100)}.jpg`,
        recognizedFood: food.name,
        nutritionalInfo: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: Math.random() * 5 + 2,
          sodium: Math.random() * 500 + 100,
        },
        confidence: food.confidence,
        scanType: ['image', 'barcode'][Math.floor(Math.random() * 2)] as any,
        isApproved: Math.random() > 0.3,
        processedBy: 'ai' as const,
        notes: `Escaneamento automático - ${scanDate.toLocaleDateString()}`,
        createdAt: scanDate,
      });
      
      await foodScan.save();
      foodScans.push(foodScan);
    }
  }
  
  logger.info(`   ✅ ${foodScans.length} escaneamentos de alimentos criados`);
  return foodScans;
}

async function seedNotifications(users: any[], pets: any[]) {
  logger.info('🔔 Criando notificações...');
  
  const notifications = [];
  const notificationTypes = [
    {
      title: 'Hora da Alimentação!',
      message: 'Está na hora de alimentar {petName}!',
      type: 'feeding',
      priority: 'high',
    },
    {
      title: 'Lembrete de Consulta',
      message: '{petName} tem consulta veterinária amanhã',
      type: 'health',
      priority: 'medium',
    },
    {
      title: 'Nova Dica OiPet',
      message: 'Confira as últimas dicas de cuidados para pets',
      type: 'news',
      priority: 'low',
    },
    {
      title: 'Pesagem Recomendada',
      message: 'Que tal verificar o peso de {petName}?',
      type: 'health',
      priority: 'medium',
    },
  ];
  
  for (const user of users) {
    const userPets = pets.filter(pet => pet.userId.toString() === user._id.toString());
    
    for (let i = 0; i < 15; i++) {
      const notifType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      const pet = userPets[Math.floor(Math.random() * userPets.length)];
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 15));
      
      const notification = new Notification({
        userId: user._id,
        title: notifType.title,
        message: notifType.message.replace('{petName}', pet?.name || 'seu pet'),
        type: notifType.type,
        priority: notifType.priority,
        isRead: Math.random() > 0.4,
        isDelivered: true,
        deliveredAt: createdDate,
        channels: ['push', 'in_app'],
        data: {
          petId: pet?._id,
          actionUrl: `/pets/${pet?._id}`,
        },
        tags: [notifType.type, 'auto-generated'],
        createdAt: createdDate,
      });
      
      await notification.save();
      notifications.push(notification);
    }
  }
  
  logger.info(`   ✅ ${notifications.length} notificações criadas`);
  return notifications;
}

async function runSeed() {
  try {
    logger.info('🌱 Iniciando seed do banco de dados...');
    
    // Conectar ao banco
    await connectDatabase();
    
    // Limpar dados existentes
    await clearDatabase();
    
    // Criar dados de teste
    const users = await seedUsers();
    const pets = await seedPets(users);
    const healthRecords = await seedHealthRecords(pets, users);
    const foodScans = await seedFoodScans(pets, users);
    const notifications = await seedNotifications(users, pets);
    
    logger.info('🎉 Seed concluído com sucesso!');
    logger.info(`   👥 ${users.length} usuários criados`);
    logger.info(`   🐕 ${pets.length} pets criados`);
    logger.info(`   🏥 ${healthRecords.length} registros de saúde criados`);
    logger.info(`   🍽️ ${foodScans.length} escaneamentos criados`);
    logger.info(`   🔔 ${notifications.length} notificações criadas`);
    
  } catch (error) {
    logger.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    logger.info('🔌 Conexão com banco fechada');
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  runSeed()
    .then(() => {
      logger.info('✅ Seed executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

export default runSeed;