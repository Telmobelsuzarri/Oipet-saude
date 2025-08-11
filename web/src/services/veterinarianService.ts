import {
  Veterinarian,
  Appointment,
  VetSearchFilters,
  AppointmentStatus,
  VetReview,
  VetSpecialty,
  AppointmentType
} from '@/types/veterinarian'

// Mock data for veterinarians
const mockVeterinarians: Veterinarian[] = [
  {
    id: '1',
    name: 'Dra. Ana Silva',
    email: 'ana.silva@oipetvet.com',
    phone: '(11) 98765-4321',
    avatar: 'https://i.pravatar.cc/150?img=1',
    specialties: [
      { id: '1', name: 'Clínica Geral', icon: '🏥' },
      { id: '2', name: 'Dermatologia', icon: '🔬' }
    ],
    clinicName: 'Clínica Veterinária PetCare',
    address: {
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Jardim Paulista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      coordinates: { lat: -23.550520, lng: -46.633308 }
    },
    workingHours: [
      { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      { dayOfWeek: 6, openTime: '08:00', closeTime: '12:00' }
    ],
    rating: 4.8,
    reviewsCount: 127,
    priceRange: 'medium',
    acceptedPayments: [
      { type: 'cash' },
      { type: 'credit' },
      { type: 'debit' },
      { type: 'pix' }
    ],
    emergencyService: true,
    homeService: false,
    description: 'Veterinária especializada em cuidados gerais e dermatologia. Mais de 10 anos de experiência.',
    registrationNumber: 'CRMV-SP 12345',
    verified: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-07-25')
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendes',
    email: 'carlos.mendes@oipetvet.com',
    phone: '(11) 97654-3210',
    avatar: 'https://i.pravatar.cc/150?img=3',
    specialties: [
      { id: '3', name: 'Cirurgia', icon: '🔪' },
      { id: '4', name: 'Ortopedia', icon: '🦴' }
    ],
    clinicName: 'Hospital Veterinário 24h',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      coordinates: { lat: -23.561684, lng: -46.656139 }
    },
    workingHours: [
      { dayOfWeek: 0, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 1, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 2, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 3, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 4, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 5, openTime: '00:00', closeTime: '23:59' },
      { dayOfWeek: 6, openTime: '00:00', closeTime: '23:59' }
    ],
    rating: 4.9,
    reviewsCount: 234,
    priceRange: 'high',
    acceptedPayments: [
      { type: 'cash' },
      { type: 'credit' },
      { type: 'debit' },
      { type: 'pix' },
      { type: 'insurance', details: 'Aceita principais planos' }
    ],
    emergencyService: true,
    homeService: true,
    description: 'Hospital 24h com especialidade em cirurgias e emergências. Equipe completa e estrutura moderna.',
    registrationNumber: 'CRMV-SP 67890',
    verified: true,
    createdAt: new Date('2022-06-15'),
    updatedAt: new Date('2024-07-25')
  },
  {
    id: '3',
    name: 'Dra. Beatriz Costa',
    email: 'beatriz.costa@oipetvet.com',
    phone: '(11) 96543-2109',
    avatar: 'https://i.pravatar.cc/150?img=5',
    specialties: [
      { id: '5', name: 'Nutrição', icon: '🥗' },
      { id: '6', name: 'Comportamento Animal', icon: '🧠' }
    ],
    clinicName: 'Clínica Bem-Estar Pet',
    address: {
      street: 'Rua Oscar Freire',
      number: '500',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05409-010',
      coordinates: { lat: -23.561935, lng: -46.670865 }
    },
    workingHours: [
      { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00' },
      { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00' },
      { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00' },
      { dayOfWeek: 4, openTime: '09:00', closeTime: '19:00' },
      { dayOfWeek: 5, openTime: '09:00', closeTime: '19:00' },
      { dayOfWeek: 6, openTime: '09:00', closeTime: '14:00' }
    ],
    rating: 4.7,
    reviewsCount: 89,
    priceRange: 'medium',
    acceptedPayments: [
      { type: 'cash' },
      { type: 'credit' },
      { type: 'debit' },
      { type: 'pix' }
    ],
    emergencyService: false,
    homeService: true,
    description: 'Especialista em nutrição e comportamento animal. Abordagem holística para o bem-estar do seu pet.',
    registrationNumber: 'CRMV-SP 11111',
    verified: true,
    createdAt: new Date('2023-08-20'),
    updatedAt: new Date('2024-07-25')
  }
]

const mockAppointments: Appointment[] = []

const mockReviews: VetReview[] = [
  {
    id: '1',
    userId: '1',
    veterinarianId: '1',
    appointmentId: 'apt1',
    rating: 5,
    comment: 'Excelente atendimento! Dra. Ana foi muito atenciosa com meu pet.',
    createdAt: new Date('2024-07-20')
  },
  {
    id: '2',
    userId: '2',
    veterinarianId: '2',
    appointmentId: 'apt2',
    rating: 5,
    comment: 'Atendimento de emergência rápido e eficiente. Salvaram meu cachorro!',
    createdAt: new Date('2024-07-18')
  }
]

class VeterinarianService {
  // Search veterinarians with filters
  async searchVeterinarians(filters?: VetSearchFilters): Promise<Veterinarian[]> {
    let results = [...mockVeterinarians]

    if (filters) {
      // Filter by specialty
      if (filters.specialty) {
        results = results.filter(vet =>
          vet.specialties.some(s => s.name.toLowerCase().includes(filters.specialty!.toLowerCase()))
        )
      }

      // Filter by city
      if (filters.city) {
        results = results.filter(vet =>
          vet.address.city.toLowerCase().includes(filters.city!.toLowerCase())
        )
      }

      // Filter by neighborhood
      if (filters.neighborhood) {
        results = results.filter(vet =>
          vet.address.neighborhood.toLowerCase().includes(filters.neighborhood!.toLowerCase())
        )
      }

      // Filter by price range
      if (filters.priceRange) {
        results = results.filter(vet => vet.priceRange === filters.priceRange)
      }

      // Filter by emergency service
      if (filters.emergencyService !== undefined) {
        results = results.filter(vet => vet.emergencyService === filters.emergencyService)
      }

      // Filter by home service
      if (filters.homeService !== undefined) {
        results = results.filter(vet => vet.homeService === filters.homeService)
      }
    }

    return results
  }

  // Get veterinarian by ID
  async getVeterinarianById(id: string): Promise<Veterinarian | null> {
    return mockVeterinarians.find(vet => vet.id === id) || null
  }

  // Get available time slots for a veterinarian
  async getAvailableTimeSlots(
    veterinarianId: string,
    date: Date
  ): Promise<string[]> {
    const vet = await this.getVeterinarianById(veterinarianId)
    if (!vet) return []

    const dayOfWeek = date.getDay()
    const workingDay = vet.workingHours.find(wh => wh.dayOfWeek === dayOfWeek)
    if (!workingDay) return []

    // Generate 30-minute time slots
    const slots: string[] = []
    const start = parseInt(workingDay.openTime.split(':')[0])
    const end = parseInt(workingDay.closeTime.split(':')[0])
    
    for (let hour = start; hour < end; hour++) {
      // Skip lunch time
      if (workingDay.lunchStart && workingDay.lunchEnd) {
        const lunchStart = parseInt(workingDay.lunchStart.split(':')[0])
        const lunchEnd = parseInt(workingDay.lunchEnd.split(':')[0])
        if (hour >= lunchStart && hour < lunchEnd) continue
      }

      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    // Filter out already booked slots
    const bookedSlots = mockAppointments
      .filter(apt => 
        apt.veterinarianId === veterinarianId &&
        apt.date.toDateString() === date.toDateString() &&
        apt.status !== AppointmentStatus.CANCELLED
      )
      .map(apt => apt.startTime)

    return slots.filter(slot => !bookedSlots.includes(slot))
  }

  // Create appointment
  async createAppointment(data: {
    userId: string
    petId: string
    veterinarianId: string
    date: Date
    startTime: string
    type: AppointmentType
    reason: string
  }): Promise<Appointment> {
    const appointment: Appointment = {
      id: Date.now().toString(),
      ...data,
      endTime: this.calculateEndTime(data.startTime, data.type),
      status: AppointmentStatus.SCHEDULED,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockAppointments.push(appointment)
    return appointment
  }

  // Get user appointments
  async getUserAppointments(userId: string): Promise<Appointment[]> {
    return mockAppointments.filter(apt => apt.userId === userId)
  }

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    const appointment = mockAppointments.find(apt => apt.id === appointmentId)
    if (!appointment) return false

    appointment.status = AppointmentStatus.CANCELLED
    appointment.updatedAt = new Date()
    return true
  }

  // Get veterinarian reviews
  async getVeterinarianReviews(veterinarianId: string): Promise<VetReview[]> {
    return mockReviews.filter(review => review.veterinarianId === veterinarianId)
  }

  // Add review
  async addReview(review: Omit<VetReview, 'id' | 'createdAt'>): Promise<VetReview> {
    const newReview: VetReview = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    mockReviews.push(newReview)

    // Update veterinarian rating
    const vet = mockVeterinarians.find(v => v.id === review.veterinarianId)
    if (vet) {
      const allReviews = mockReviews.filter(r => r.veterinarianId === review.veterinarianId)
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
      vet.rating = totalRating / allReviews.length
      vet.reviewsCount = allReviews.length
    }

    return newReview
  }

  // Get all specialties
  async getSpecialties(): Promise<VetSpecialty[]> {
    const specialties = new Map<string, VetSpecialty>()
    
    mockVeterinarians.forEach(vet => {
      vet.specialties.forEach(specialty => {
        if (!specialties.has(specialty.id)) {
          specialties.set(specialty.id, specialty)
        }
      })
    })

    return Array.from(specialties.values())
  }

  // Calculate distance between coordinates
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Calculate end time based on appointment type
  private calculateEndTime(startTime: string, type: AppointmentType): string {
    const [hours, minutes] = startTime.split(':').map(Number)
    let duration = 30 // default 30 minutes

    switch (type) {
      case AppointmentType.SURGERY:
        duration = 120 // 2 hours
        break
      case AppointmentType.EXAM:
        duration = 60 // 1 hour
        break
      case AppointmentType.VACCINATION:
        duration = 15 // 15 minutes
        break
    }

    const endMinutes = minutes + duration
    const endHours = hours + Math.floor(endMinutes / 60)
    const finalMinutes = endMinutes % 60

    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`
  }
}

export const veterinarianService = new VeterinarianService()