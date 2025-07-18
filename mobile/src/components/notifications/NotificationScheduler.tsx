/**
 * NotificationScheduler - Componente para agendar notificações locais
 */

import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../../services/NotificationService';
import { useAppSelector } from '../../store';

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  trigger: Date;
  data?: any;
  type: 'vaccination' | 'medication' | 'appointment' | 'feeding' | 'activity';
}

export const NotificationScheduler: React.FC = () => {
  const pets = useAppSelector(state => state.pets.pets);
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    setupDefaultNotifications();
  }, [pets]);

  const setupDefaultNotifications = async () => {
    // Cancelar todas as notificações existentes
    await NotificationService.cancelAllLocalNotifications();

    // Configurar notificações diárias
    await scheduleDailyReminders();

    // Configurar notificações específicas para cada pet
    pets.forEach(pet => {
      scheduleNotificationsForPet(pet);
    });
  };

  const scheduleDailyReminders = async () => {
    // Lembrete matinal de check-in
    await NotificationService.scheduleLocalNotification(
      'Bom dia! 🌞',
      'Não esqueça de fazer o check-in diário dos seus pets',
      {
        hour: 8,
        minute: 0,
        repeats: true,
      },
      {
        type: 'reminder',
        screen: 'Health',
      }
    );

    // Lembrete de alimentação (manhã)
    await NotificationService.scheduleLocalNotification(
      'Hora do Café da Manhã 🥣',
      'Seus pets estão esperando pela primeira refeição do dia',
      {
        hour: 7,
        minute: 0,
        repeats: true,
      },
      {
        type: 'feeding',
        screen: 'Health',
      }
    );

    // Lembrete de alimentação (noite)
    await NotificationService.scheduleLocalNotification(
      'Hora do Jantar 🍖',
      'Não esqueça da última refeição do dia para seus pets',
      {
        hour: 19,
        minute: 0,
        repeats: true,
      },
      {
        type: 'feeding',
        screen: 'Health',
      }
    );

    // Lembrete de atividade física
    await NotificationService.scheduleLocalNotification(
      'Hora de Brincar! 🎾',
      'Que tal um passeio ou brincadeira com seus pets?',
      {
        hour: 17,
        minute: 0,
        repeats: true,
      },
      {
        type: 'activity',
        screen: 'Health',
      }
    );
  };

  const scheduleNotificationsForPet = async (pet: any) => {
    // Lembrete semanal de peso
    const weightReminder = new Date();
    weightReminder.setDate(weightReminder.getDate() + ((7 - weightReminder.getDay()) % 7 || 7)); // Próximo domingo
    weightReminder.setHours(10, 0, 0, 0);

    await NotificationService.scheduleLocalNotification(
      `Hora de pesar ${pet.name} 📊`,
      'Registre o peso semanal para acompanhar a saúde',
      weightReminder,
      {
        type: 'health',
        screen: 'AddHealthRecord',
        params: { petId: pet._id },
      }
    );

    // Lembrete mensal de check-up
    const checkupReminder = new Date();
    checkupReminder.setMonth(checkupReminder.getMonth() + 1);
    checkupReminder.setDate(1);
    checkupReminder.setHours(9, 0, 0, 0);

    await NotificationService.scheduleLocalNotification(
      `Check-up Mensal - ${pet.name} 🏥`,
      'Considere agendar uma visita ao veterinário',
      checkupReminder,
      {
        type: 'appointment',
        screen: 'PetDetail',
        params: { petId: pet._id },
      }
    );

    // Notificações baseadas na idade do pet
    const birthDate = new Date(pet.birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());

    if (ageInMonths < 12) {
      // Filhotes - lembretes mais frequentes
      await scheduleVaccinationReminders(pet, true);
    } else if (ageInMonths > 84) {
      // Idosos - lembretes de cuidados especiais
      await scheduleSeniorCareReminders(pet);
    }
  };

  const scheduleVaccinationReminders = async (pet: any, isPuppy: boolean) => {
    const vaccinationSchedule = isPuppy ? [
      { weeks: 6, vaccine: 'V8/V10' },
      { weeks: 9, vaccine: 'V8/V10 (2ª dose)' },
      { weeks: 12, vaccine: 'V8/V10 (3ª dose)' },
      { weeks: 16, vaccine: 'Antirrábica' },
    ] : [
      { months: 12, vaccine: 'V8/V10 Anual' },
      { months: 12, vaccine: 'Antirrábica Anual' },
    ];

    // Implementar lógica de agendamento baseada na idade do pet
  };

  const scheduleSeniorCareReminders = async (pet: any) => {
    // Lembrete quinzenal de medicação
    const medicationReminder = new Date();
    medicationReminder.setDate(medicationReminder.getDate() + 14);
    medicationReminder.setHours(8, 0, 0, 0);

    await NotificationService.scheduleLocalNotification(
      `Medicação - ${pet.name} 💊`,
      'Verifique se há medicações a serem administradas',
      medicationReminder,
      {
        type: 'medication',
        screen: 'PetDetail',
        params: { petId: pet._id },
      }
    );
  };

  return null; // Componente não renderiza nada
};

/**
 * Hook para agendar notificação única
 */
export const useScheduleNotification = () => {
  const scheduleNotification = async (
    title: string,
    body: string,
    trigger: Date | number,
    data?: any
  ) => {
    return await NotificationService.scheduleLocalNotification(title, body, trigger, data);
  };

  const cancelNotification = async (notificationId: string) => {
    return await NotificationService.cancelLocalNotification(notificationId);
  };

  return {
    scheduleNotification,
    cancelNotification,
  };
};