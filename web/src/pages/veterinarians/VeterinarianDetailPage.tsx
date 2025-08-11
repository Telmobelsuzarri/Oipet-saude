import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { GlassCard } from '@/components/ui/GlassContainer'
import { veterinarianService } from '@/services/veterinarianService'
import { Veterinarian } from '@/types/veterinarian'
import { format, addDays, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const VeterinarianDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [veterinarian, setVeterinarian] = useState<Veterinarian | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadVeterinarianDetails()
    }
  }, [id])

  const loadVeterinarianDetails = async () => {
    setLoading(true)
    try {
      const vet = await veterinarianService.getVeterinarianById(id!)
      setVeterinarian(vet)
    } catch (error) {
      console.error('Error loading veterinarian:', error)
    } finally {
      setLoading(false)
    }
  }


  const getPriceRangeDisplay = (range: string) => {
    switch (range) {
      case 'low': return '💰 Econômico'
      case 'medium': return '💰💰 Médio'
      case 'high': return '💰💰💰 Premium'
      default: return ''
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    )
  }

  if (!veterinarian) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-gray-500">Veterinário não encontrado.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/app/veterinarians')}
            className="mt-4 px-6 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
          >
            Voltar para Lista
          </motion.button>
        </div>
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
          className="mb-6"
        >
          <button
            onClick={() => navigate('/app/veterinarians')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Voltar para Lista
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Veterinarian Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <GlassCard className="p-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-6 mb-6">
                <img
                  src={veterinarian.avatar || `https://ui-avatars.com/api/?name=${veterinarian.name}&background=E85A5A&color=fff`}
                  alt={veterinarian.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{veterinarian.name}</h1>
                      <p className="text-gray-600">{veterinarian.clinicName}</p>
                      <p className="text-sm text-gray-500 mt-1">{veterinarian.registrationNumber}</p>
                    </div>
                    {veterinarian.verified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Verificado
                      </span>
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-semibold">{veterinarian.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">({veterinarian.reviewsCount} avaliações)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {veterinarian.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sobre</h3>
                  <p className="text-gray-700">{veterinarian.description}</p>
                </div>
              )}

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {veterinarian.specialties.map(specialty => (
                    <span
                      key={specialty.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <span className="mr-1 text-lg">{specialty.icon}</span>
                      {specialty.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Localização</h3>
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-700">
                      {veterinarian.address.street}, {veterinarian.address.number}
                      {veterinarian.address.complement && ` - ${veterinarian.address.complement}`}
                    </p>
                    <p className="text-gray-600">
                      {veterinarian.address.neighborhood}, {veterinarian.address.city} - {veterinarian.address.state}
                    </p>
                    <p className="text-gray-600">CEP: {veterinarian.address.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{veterinarian.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{veterinarian.email}</span>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-glass">
                  <CurrencyDollarIcon className="h-6 w-6 mx-auto mb-1 text-gray-700" />
                  <p className="text-sm font-medium">{getPriceRangeDisplay(veterinarian.priceRange)}</p>
                </div>
                {veterinarian.emergencyService && (
                  <div className="text-center p-3 bg-red-50 rounded-glass">
                    <ExclamationTriangleIcon className="h-6 w-6 mx-auto mb-1 text-red-600" />
                    <p className="text-sm font-medium text-red-700">Emergência 24h</p>
                  </div>
                )}
                {veterinarian.homeService && (
                  <div className="text-center p-3 bg-blue-50 rounded-glass">
                    <HomeIcon className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">Atende em Casa</p>
                  </div>
                )}
              </div>

              {/* Working Hours */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Horários de Atendimento</h3>
                <div className="space-y-2">
                  {veterinarian.workingHours.map(wh => (
                    <div key={wh.dayOfWeek} className="flex justify-between text-sm">
                      <span className="font-medium">
                        {format(addDays(startOfToday(), wh.dayOfWeek), 'EEEE', { locale: ptBR })}
                      </span>
                      <span className="text-gray-600">
                        {wh.openTime} - {wh.closeTime}
                        {wh.lunchStart && wh.lunchEnd && ` (Almoço: ${wh.lunchStart} - ${wh.lunchEnd})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-coral-500" />
                Entre em Contato
              </h2>

              <div className="space-y-4">
                {/* WhatsApp Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const phoneNumber = veterinarian!.phone.replace(/\D/g, '')
                    const message = `Olá Dr(a). ${veterinarian!.name}! 

Encontrei seu perfil no OiPet Saúde e gostaria de agendar uma consulta.

Clínica: ${veterinarian!.clinicName}
Meu interesse: Consulta veterinária

Poderia me informar os horários disponíveis?

Obrigado!`
                    window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
                  }}
                  className="w-full py-3 bg-green-500 text-white rounded-glass hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Agendar via WhatsApp
                </motion.button>

                {/* Phone Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open(`tel:${veterinarian!.phone}`, '_self')}
                  className="w-full py-3 bg-blue-500 text-white rounded-glass hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Ligar Agora
                </motion.button>

                {/* Email Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const subject = 'Agendamento de Consulta - OiPet Saúde'
                    const body = `Olá Dr(a). ${veterinarian!.name},

Encontrei seu perfil no OiPet Saúde e gostaria de agendar uma consulta.

Aguardo retorno com os horários disponíveis.

Atenciosamente,
[Seu nome]`
                    window.open(`mailto:${veterinarian!.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self')
                  }}
                  className="w-full py-3 bg-gray-500 text-white rounded-glass hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  Enviar E-mail
                </motion.button>

                {/* Quick Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-glass">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    💡 Dicas para Agendamento
                  </h3>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Tenha em mãos o histórico do seu pet</li>
                    <li>• Informe sintomas ou comportamentos diferentes</li>
                    <li>• Pergunte sobre formas de pagamento</li>
                    <li>• Confirme o endereço e estacionamento</li>
                  </ul>
                </div>

                {/* Price Range Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-glass">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Faixa de Preço</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {getPriceRangeDisplay(veterinarian!.priceRange)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}