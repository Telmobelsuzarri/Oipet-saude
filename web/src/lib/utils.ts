import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffInMs = now.getTime() - target.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) return 'Agora'
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`
  if (diffInHours < 24) return `${diffInHours}h atrás`
  if (diffInDays < 7) return `${diffInDays}d atrás`
  
  return formatDate(date)
}

export function calculateAge(birthDate: string | Date): string {
  const birth = new Date(birthDate)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - birth.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`
}

export function formatHeight(height: number): string {
  return `${height.toFixed(1)} cm`
}

export function getIMCClassification(imc: number): {
  classification: string
  color: string
} {
  if (imc < 18.5) {
    return { classification: 'Abaixo do peso', color: 'text-yellow-600' }
  } else if (imc >= 18.5 && imc < 25) {
    return { classification: 'Peso ideal', color: 'text-green-600' }
  } else if (imc >= 25 && imc < 30) {
    return { classification: 'Sobrepeso', color: 'text-orange-600' }
  } else {
    return { classification: 'Obesidade', color: 'text-red-600' }
  }
}

export function getMoodEmoji(mood: string): string {
  switch (mood) {
    case 'very_sad': return '😢'
    case 'sad': return '😟'
    case 'neutral': return '😐'
    case 'happy': return '😊'
    case 'very_happy': return '😍'
    default: return '😐'
  }
}

export function getSpeciesEmoji(species: string): string {
  switch (species) {
    case 'dog': return '🐕'
    case 'cat': return '🐱'
    default: return '🐾'
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isPhone(phone: string): boolean {
  const phoneRegex = /^(\+55\s?)?(\(?[1-9]{2}\)?\s?)?[9]?[0-9]{4}-?[0-9]{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{1})(\d{4})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]} ${match[3]}-${match[4]}`
  }
  return phone
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}