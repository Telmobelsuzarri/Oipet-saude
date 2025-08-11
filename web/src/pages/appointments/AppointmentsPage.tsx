import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { GlassCard } from '@/components/ui/GlassContainer'
import { veterinarianService } from '@/services/veterinarianService'
import { usePetStore } from '@/stores/petStore'
import { useAuthStore } from '@/stores/authStore'
import { Appointment, AppointmentStatus, Veterinarian } from '@/types/veterinarian'
import { format, isPast, isFuture, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuthStore()
  const { pets } = usePetStore()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [veterinarians, setVeterinarians] = useState<Map<string, Veterinarian>>(new Map())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  const loadAppointments = async () => {
    setLoading(true)
    try {
      const userAppointments = await veterinarianService.getUserAppointments(user!.id)
      setAppointments(userAppointments)
      
      // Load veterinarian details for each appointment
      const vetMap = new Map<string, Veterinarian>()
      for (const apt of userAppointments) {
        if (!vetMap.has(apt.veterinarianId)) {
          const vet = await veterinarianService.getVeterinarianById(apt.veterinarianId)
          if (vet) {
            vetMap.set(apt.veterinarianId, vet)
          }
        }
      }
      setVeterinarians(vetMap)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    setCancellingId(appointmentId)
    try {
      const success = await veterinarianService.cancelAppointment(appointmentId)
      if (success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: AppointmentStatus.CANCELLED }
              : apt
          )
        )
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED: return 'bg-blue-100 text-blue-800'
      case AppointmentStatus.CONFIRMED: return 'bg-green-100 text-green-800'
      case AppointmentStatus.COMPLETED: return 'bg-gray-100 text-gray-800'
      case AppointmentStatus.CANCELLED: return 'bg-red-100 text-red-800'
      case AppointmentStatus.NO_SHOW: return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED: return 'Agendado'
      case AppointmentStatus.CONFIRMED: return 'Confirmado'
      case AppointmentStatus.COMPLETED: return 'Concluído'
      case AppointmentStatus.CANCELLED: return 'Cancelado'
      case AppointmentStatus.NO_SHOW: return 'Não compareceu'
      default: return status
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'upcoming') {
      return isFuture(apt.date) || isToday(apt.date)
    } else if (filter === 'past') {
      return isPast(apt.date) && !isToday(apt.date)
    }
    return true
  }).sort((a, b) => {
    if (filter === 'upcoming') {
      return a.date.getTime() - b.date.getTime()
    }
    return b.date.getTime() - a.date.getTime()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-coral-500" />
            Meus Agendamentos
          </h1>
          <p className="text-gray-600">
            Gerencie suas consultas veterinárias
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex space-x-2">
            {[
              { value: 'upcoming', label: 'Próximas' },
              { value: 'past', label: 'Anteriores' },
              { value: 'all', label: 'Todas' }
            ].map(option => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(option.value as any)}
                className={`px-4 py-2 rounded-glass transition-colors ${
                  filter === option.value
                    ? 'bg-coral-500 text-white'
                    : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/70'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <GlassCard className="inline-block p-8">
              <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'upcoming' 
                  ? 'Você não tem consultas agendadas.'
                  : filter === 'past'
                  ? 'Você não tem consultas anteriores.'
                  : 'Você não tem agendamentos.'}
              </p>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment, index) => {
              const veterinarian = veterinarians.get(appointment.veterinarianId)
              const pet = pets.find(p => p.id === appointment.petId)
              
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Date and Time */}
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-5 w-5 text-coral-500" />
                            <span className="font-semibold">
                              {format(appointment.date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-5 w-5 text-coral-500" />
                            <span className="font-semibold">
                              {appointment.startTime} - {appointment.endTime}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>

                        {/* Veterinarian Info */}
                        {veterinarian && (
                          <div className="flex items-center space-x-4 mb-3">
                            <img
                              src={veterinarian.avatar || `https://ui-avatars.com/api/?name=${veterinarian.name}&background=E85A5A&color=fff`}
                              alt={veterinarian.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{veterinarian.name}</p>
                              <p className="text-sm text-gray-600">{veterinarian.clinicName}</p>
                            </div>
                          </div>
                        )}

                        {/* Pet Info */}
                        {pet && (
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-2xl">{pet.species === 'dog' ? '🐕' : '🐱'}</span>
                            <span className="font-medium">{pet.name}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">{appointment.reason}</span>
                          </div>
                        )}

                        {/* Location */}
                        {veterinarian && (
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {veterinarian.address.street}, {veterinarian.address.number} - 
                              {veterinarian.address.neighborhood}, {veterinarian.address.city}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-start space-x-2 ml-4">
                        {veterinarian && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(`tel:${veterinarian.phone}`, '_self')}
                            className="p-2 bg-gray-100 text-gray-700 rounded-glass hover:bg-gray-200 transition-colors"
                          >
                            <PhoneIcon className="h-5 w-5" />
                          </motion.button>
                        )}
                        
                        {appointment.status === AppointmentStatus.SCHEDULED && 
                         isFuture(appointment.date) && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={cancellingId === appointment.id}
                            className="p-2 bg-red-100 text-red-700 rounded-glass hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            {cancellingId === appointment.id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700"></div>
                            ) : (
                              <XMarkIcon className="h-5 w-5" />
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Additional Info for Completed Appointments */}
                    {appointment.status === AppointmentStatus.COMPLETED && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>Consulta realizada</span>
                          </div>
                          {appointment.price && (
                            <span className="text-sm font-semibold">
                              R$ {appointment.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {appointment.prescriptions && appointment.prescriptions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">
                              {appointment.prescriptions.length} medicamento(s) prescrito(s)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Floating Action Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.href = '/app/veterinarians'}
            className="w-14 h-14 bg-coral-500 text-white rounded-full shadow-lg hover:bg-coral-600 transition-colors flex items-center justify-center"
          >
            <CalendarIcon className="h-6 w-6" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}