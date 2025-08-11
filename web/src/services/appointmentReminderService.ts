import { Appointment, AppointmentStatus } from '@/types/veterinarian'
import { addHours, isBefore, isAfter, startOfToday } from 'date-fns'
import { notificationService } from './notificationService'

class AppointmentReminderService {
  private reminderIntervalId: NodeJS.Timeout | null = null

  // Start reminder service
  startReminderService(userId: string) {
    // Check for reminders every 5 minutes
    this.reminderIntervalId = setInterval(() => {
      this.checkAppointmentReminders(userId)
    }, 5 * 60 * 1000) // 5 minutes

    // Also check immediately
    this.checkAppointmentReminders(userId)
  }

  // Stop reminder service
  stopReminderService() {
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId)
      this.reminderIntervalId = null
    }
  }

  // Check for appointments that need reminders
  private async checkAppointmentReminders(userId: string) {
    try {
      // Get user appointments from veterinarian service
      const { veterinarianService } = await import('./veterinarianService')
      const appointments = await veterinarianService.getUserAppointments(userId)
      
      const now = new Date()
      const tomorrow = addHours(now, 24)
      const in2Hours = addHours(now, 2)

      appointments.forEach(appointment => {
        if (appointment.status === AppointmentStatus.SCHEDULED ||
            appointment.status === AppointmentStatus.CONFIRMED) {
          
          const appointmentTime = new Date(appointment.date)
          appointmentTime.setHours(
            parseInt(appointment.startTime.split(':')[0]),
            parseInt(appointment.startTime.split(':')[1])
          )

          // 24-hour reminder
          if (isAfter(appointmentTime, now) && isBefore(appointmentTime, tomorrow)) {
            this.send24HourReminder(appointment)
          }

          // 2-hour reminder
          if (isAfter(appointmentTime, now) && isBefore(appointmentTime, in2Hours)) {
            this.send2HourReminder(appointment)
          }
        }
      })
    } catch (error) {
      console.error('Error checking appointment reminders:', error)
    }
  }

  // Send 24-hour reminder
  private async send24HourReminder(appointment: Appointment) {
    const notificationId = `apt-24h-${appointment.id}`
    
    // Check if we already sent this reminder
    const existingNotifications = notificationService.getNotifications()
    const alreadySent = existingNotifications.some(n => n.id === notificationId)
    
    if (!alreadySent) {
      await notificationService.createNotification({
        id: notificationId,
        title: '🏥 Lembrete de Consulta - Amanhã',
        message: `Você tem uma consulta agendada para amanhã às ${appointment.startTime}`,
        type: 'reminder',
        priority: 'high',
        relatedId: appointment.id,
        relatedType: 'appointment'
      })
    }
  }

  // Send 2-hour reminder
  private async send2HourReminder(appointment: Appointment) {
    const notificationId = `apt-2h-${appointment.id}`
    
    // Check if we already sent this reminder
    const existingNotifications = notificationService.getNotifications()
    const alreadySent = existingNotifications.some(n => n.id === notificationId)
    
    if (!alreadySent) {
      await notificationService.createNotification({
        id: notificationId,
        title: '⏰ Consulta em 2 horas!',
        message: `Sua consulta veterinária está agendada para hoje às ${appointment.startTime}`,
        type: 'urgent',
        priority: 'critical',
        relatedId: appointment.id,
        relatedType: 'appointment'
      })
    }
  }

  // Schedule a custom reminder
  async scheduleCustomReminder(
    appointment: Appointment,
    reminderTime: Date,
    message: string
  ) {
    const notificationId = `apt-custom-${appointment.id}-${reminderTime.getTime()}`
    
    // Calculate delay
    const delay = reminderTime.getTime() - Date.now()
    
    if (delay > 0) {
      setTimeout(() => {
        notificationService.createNotification({
          id: notificationId,
          title: '📅 Lembrete Personalizado',
          message,
          type: 'reminder',
          priority: 'medium',
          relatedId: appointment.id,
          relatedType: 'appointment'
        })
      }, delay)
    }
  }

  // Get upcoming appointments for today
  async getTodaysAppointments(userId: string): Promise<Appointment[]> {
    const { veterinarianService } = await import('./veterinarianService')
    const appointments = await veterinarianService.getUserAppointments(userId)
    
    const today = startOfToday()
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.toDateString() === today.toDateString() &&
             (apt.status === AppointmentStatus.SCHEDULED || 
              apt.status === AppointmentStatus.CONFIRMED)
    })
  }
}

export const appointmentReminderService = new AppointmentReminderService()