/**
 * Notification Templates - Modelos de notificações
 */

export interface NotificationTemplate {
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'alert' | 'promotion' | 'health' | 'system';
  category: 'general' | 'health' | 'feeding' | 'activity' | 'vaccination' | 'appointment';
  action?: {
    screen: string;
    params?: any;
  };
}

export const notificationTemplates = {
  // Templates de Saúde
  health: {
    weightReminder: (petName: string): NotificationTemplate => ({
      title: `Hora de pesar ${petName} 📊`,
      message: 'Registre o peso para acompanhar a saúde do seu pet',
      type: 'reminder',
      category: 'health',
      action: {
        screen: 'AddHealthRecord',
        params: { defaultTab: 'weight' }
      }
    }),

    activityReminder: (petName: string): NotificationTemplate => ({
      title: `${petName} precisa se exercitar! 🎾`,
      message: 'Que tal um passeio ou brincadeira?',
      type: 'reminder',
      category: 'activity',
      action: {
        screen: 'AddHealthRecord',
        params: { defaultTab: 'activity' }
      }
    }),

    healthAlert: (petName: string, issue: string): NotificationTemplate => ({
      title: `⚠️ Alerta de Saúde - ${petName}`,
      message: issue,
      type: 'alert',
      category: 'health',
      action: {
        screen: 'PetHealthHistory'
      }
    }),

    imcWarning: (petName: string, classification: string): NotificationTemplate => ({
      title: `IMC de ${petName} requer atenção`,
      message: `Seu pet está ${classification}. Considere ajustar a dieta.`,
      type: 'alert',
      category: 'health',
      action: {
        screen: 'PetDetail'
      }
    }),
  },

  // Templates de Alimentação
  feeding: {
    morningMeal: (): NotificationTemplate => ({
      title: 'Hora do Café da Manhã 🥣',
      message: 'Seus pets estão esperando pela primeira refeição',
      type: 'reminder',
      category: 'feeding',
      action: {
        screen: 'Health'
      }
    }),

    eveningMeal: (): NotificationTemplate => ({
      title: 'Hora do Jantar 🍖',
      message: 'Não esqueça da última refeição do dia',
      type: 'reminder',
      category: 'feeding',
      action: {
        screen: 'Health'
      }
    }),

    waterReminder: (petName: string): NotificationTemplate => ({
      title: `Hidratação de ${petName} 💧`,
      message: 'Verifique se há água fresca disponível',
      type: 'reminder',
      category: 'feeding',
      action: {
        screen: 'AddHealthRecord',
        params: { defaultTab: 'water' }
      }
    }),
  },

  // Templates de Vacinação
  vaccination: {
    upcoming: (petName: string, vaccine: string, days: number): NotificationTemplate => ({
      title: `Vacina Próxima - ${petName} 💉`,
      message: `${vaccine} em ${days} dias. Agende com o veterinário.`,
      type: 'reminder',
      category: 'vaccination',
      action: {
        screen: 'PetDetail'
      }
    }),

    overdue: (petName: string, vaccine: string): NotificationTemplate => ({
      title: `⚠️ Vacina Atrasada - ${petName}`,
      message: `${vaccine} está atrasada. Agende urgente!`,
      type: 'alert',
      category: 'vaccination',
      action: {
        screen: 'PetDetail'
      }
    }),
  },

  // Templates de Consultas
  appointment: {
    reminder: (petName: string, type: string, date: Date): NotificationTemplate => ({
      title: `Consulta Agendada - ${petName} 🏥`,
      message: `${type} em ${date.toLocaleDateString('pt-BR')}`,
      type: 'reminder',
      category: 'appointment',
      action: {
        screen: 'PetDetail'
      }
    }),

    checkupDue: (petName: string): NotificationTemplate => ({
      title: `Check-up Recomendado - ${petName}`,
      message: 'Já faz um tempo desde a última consulta veterinária',
      type: 'info',
      category: 'appointment',
      action: {
        screen: 'PetDetail'
      }
    }),
  },

  // Templates de Sistema
  system: {
    welcome: (userName: string): NotificationTemplate => ({
      title: 'Bem-vindo ao OiPet Saúde! 🎉',
      message: `Olá ${userName}, estamos felizes em ter você aqui`,
      type: 'info',
      category: 'general',
      action: {
        screen: 'Home'
      }
    }),

    firstPet: (): NotificationTemplate => ({
      title: 'Parabéns pelo novo pet! 🐾',
      message: 'Comece a registrar a saúde do seu companheiro',
      type: 'info',
      category: 'general',
      action: {
        screen: 'AddHealthRecord'
      }
    }),

    achievementUnlocked: (achievement: string): NotificationTemplate => ({
      title: 'Conquista Desbloqueada! 🏆',
      message: achievement,
      type: 'info',
      category: 'general',
      action: {
        screen: 'Profile'
      }
    }),

    dataBackup: (): NotificationTemplate => ({
      title: 'Dados Sincronizados ✅',
      message: 'Seus registros foram salvos com segurança',
      type: 'system',
      category: 'general'
    }),
  },

  // Templates Promocionais
  promotion: {
    newProduct: (productName: string): NotificationTemplate => ({
      title: 'Novidade na OiPet! 🛍️',
      message: `Conheça ${productName} - perfeito para seu pet`,
      type: 'promotion',
      category: 'general',
      action: {
        screen: 'Store'
      }
    }),

    discount: (percentage: number, category: string): NotificationTemplate => ({
      title: `${percentage}% OFF em ${category} 🎁`,
      message: 'Aproveite essa oferta especial!',
      type: 'promotion',
      category: 'general',
      action: {
        screen: 'Store'
      }
    }),
  },
};

/**
 * Função auxiliar para criar notificação personalizada
 */
export const createCustomNotification = (
  title: string,
  message: string,
  type: NotificationTemplate['type'] = 'info',
  category: NotificationTemplate['category'] = 'general',
  action?: NotificationTemplate['action']
): NotificationTemplate => ({
  title,
  message,
  type,
  category,
  action,
});

/**
 * Função para determinar prioridade da notificação
 */
export const getNotificationPriority = (type: NotificationTemplate['type']): 'high' | 'medium' | 'low' => {
  switch (type) {
    case 'alert':
      return 'high';
    case 'reminder':
    case 'health':
      return 'medium';
    case 'info':
    case 'promotion':
    case 'system':
    default:
      return 'low';
  }
};