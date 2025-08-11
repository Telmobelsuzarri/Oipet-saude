export interface Veterinarian {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  specialties: VetSpecialty[]
  clinicName: string
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  workingHours: WorkingHours[]
  rating: number
  reviewsCount: number
  priceRange: 'low' | 'medium' | 'high'
  acceptedPayments: PaymentMethod[]
  emergencyService: boolean
  homeService: boolean
  description?: string
  registrationNumber: string // CRMV
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface VetSpecialty {
  id: string
  name: string
  icon: string
}

export interface WorkingHours {
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  openTime: string // "08:00"
  closeTime: string // "18:00"
  lunchStart?: string // "12:00"
  lunchEnd?: string // "13:00"
}

export interface PaymentMethod {
  type: 'cash' | 'credit' | 'debit' | 'pix' | 'insurance'
  details?: string
}

export interface Appointment {
  id: string
  userId: string
  petId: string
  veterinarianId: string
  date: Date
  startTime: string
  endTime: string
  type: AppointmentType
  status: AppointmentStatus
  reason: string
  notes?: string
  price?: number
  prescriptions?: Prescription[]
  exams?: Exam[]
  createdAt: Date
  updatedAt: Date
}

export enum AppointmentType {
  ROUTINE = 'routine',
  EMERGENCY = 'emergency',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  EXAM = 'exam',
  FOLLOWUP = 'followup'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface Exam {
  id: string
  name: string
  type: string
  result?: string
  fileUrl?: string
  date: Date
}

export interface VetReview {
  id: string
  userId: string
  veterinarianId: string
  appointmentId: string
  rating: number
  comment?: string
  createdAt: Date
}

export interface VetSearchFilters {
  specialty?: string
  city?: string
  neighborhood?: string
  priceRange?: 'low' | 'medium' | 'high'
  emergencyService?: boolean
  homeService?: boolean
  maxDistance?: number // km
  availability?: {
    date: Date
    timeSlot?: string
  }
}