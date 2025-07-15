/**
 * Modelos do MongoDB - Exportações centralizadas
 */

export { User, IUser } from './User';
export { Pet, IPet } from './Pet';
export { HealthRecord, IHealthRecord } from './HealthRecord';
export { FoodScan, IFoodScan } from './FoodScan';
export { Notification, INotification } from './Notification';

// Função para inicializar todos os modelos (garantir que os índices sejam criados)
export const initializeModels = async () => {
  const { User } = await import('./User');
  const { Pet } = await import('./Pet');
  const { HealthRecord } = await import('./HealthRecord');
  const { FoodScan } = await import('./FoodScan');
  const { Notification } = await import('./Notification');

  // Criar índices se não existirem
  await Promise.all([
    User.createIndexes(),
    Pet.createIndexes(),
    HealthRecord.createIndexes(),
    FoodScan.createIndexes(),
    Notification.createIndexes(),
  ]);

  console.log('✅ Todos os índices do banco de dados foram criados');
};