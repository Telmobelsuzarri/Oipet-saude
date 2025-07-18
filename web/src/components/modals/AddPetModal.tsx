import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

import { GlassContainer } from '@/components/ui/GlassContainer'
import { useNotifications } from '@/hooks/useNotifications'
import { usePetStore } from '@/stores/petStore'

interface AddPetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (pet: any) => void
}

interface PetForm {
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  birthDate: string
  weight: number
  height: number
  gender: 'male' | 'female'
  isNeutered: boolean
  avatar?: FileList
}

const speciesOptions = [
  { value: 'dog', label: 'Cachorro' },
  { value: 'cat', label: 'Gato' },
  { value: 'other', label: 'Outro' }
]

export const AddPetModal: React.FC<AddPetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { showSuccess, showReminder } = useNotifications()
  const { createPet, isLoading } = usePetStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PetForm>({
    defaultValues: {
      name: '',
      species: 'dog',
      breed: '',
      birthDate: '',
      weight: 0,
      height: 0,
      gender: 'male',
      isNeutered: false,
    },
  })

  const watchedAvatar = watch('avatar')

  React.useEffect(() => {
    if (watchedAvatar && watchedAvatar.length > 0) {
      const file = watchedAvatar[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [watchedAvatar])

  const handleClose = () => {
    reset()
    setAvatarPreview(null)
    onClose()
  }

  const onSubmit = async (data: PetForm) => {
    try {
      // Prepare data for API
      const petData = {
        name: data.name,
        species: data.species,
        breed: data.breed,
        birthDate: data.birthDate,
        weight: data.weight,
        height: data.height,
        gender: data.gender,
        isNeutered: data.isNeutered,
        // TODO: Implement avatar upload
        avatar: avatarPreview || undefined,
      }

      // Call API through store
      await createPet(petData)
      
      // Show success notification
      showSuccess(
        'Pet cadastrado com sucesso!',
        `${data.name} foi adicionado aos seus pets`,
        { actionUrl: '/app/pets' }
      )
      
      // Show reminder notification for health checkup
      showReminder(
        'Primeiro check-up',
        'Não esqueça de fazer o primeiro registro de saúde',
        data.name,
        {
          petId: Date.now().toString(), // Will be replaced with real ID
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          actionUrl: '/app/health'
        }
      )
      
      onSuccess?.(petData)
      handleClose()
    } catch (error: any) {
      // Error handling is done by the store
      console.error('Error creating pet:', error)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <GlassContainer variant="modal" className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Adicionar Pet</h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div
                      onClick={handleAvatarClick}
                      className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-coral-500 transition-colors overflow-hidden"
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <CameraIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <input
                      {...register('avatar')}
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Pet *
                    </label>
                    <input
                      {...register('name', { 
                        required: 'Nome é obrigatório',
                        minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' }
                      })}
                      type="text"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: Rex, Mimi, Bob"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Species */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espécie *
                    </label>
                    <select
                      {...register('species', { required: 'Espécie é obrigatória' })}
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                    >
                      {speciesOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.species && (
                      <p className="mt-1 text-sm text-red-600">{errors.species.message}</p>
                    )}
                  </div>

                  {/* Breed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raça *
                    </label>
                    <input
                      {...register('breed', { required: 'Raça é obrigatória' })}
                      type="text"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: Golden Retriever, Persa, SRD"
                    />
                    {errors.breed && (
                      <p className="mt-1 text-sm text-red-600">{errors.breed.message}</p>
                    )}
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento *
                    </label>
                    <input
                      {...register('birthDate', { required: 'Data de nascimento é obrigatória' })}
                      type="date"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                    />
                    {errors.birthDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
                    )}
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (kg) *
                    </label>
                    <input
                      {...register('weight', { 
                        required: 'Peso é obrigatório',
                        min: { value: 0.1, message: 'Peso deve ser maior que 0' }
                      })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: 25.5"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                    )}
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Altura (cm) *
                    </label>
                    <input
                      {...register('height', { 
                        required: 'Altura é obrigatória',
                        min: { value: 1, message: 'Altura deve ser maior que 0' }
                      })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: 60"
                    />
                    {errors.height && (
                      <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                    )}
                  </div>
                </div>

                {/* Gender and Neutered */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sexo *
                    </label>
                    <select
                      {...register('gender', { required: 'Sexo é obrigatório' })}
                      className="w-full px-4 py-3 bg-white/50 border border-white/20 rounded-glass focus:bg-white/70 focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="male">Macho</option>
                      <option value="female">Fêmea</option>
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                    )}
                  </div>

                  {/* Neutered */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Castrado/Esterilizado
                    </label>
                    <div className="flex items-center space-x-3 mt-3">
                      <label className="flex items-center">
                        <input
                          {...register('isNeutered')}
                          type="checkbox"
                          className="rounded border-gray-300 text-coral-500 focus:ring-coral-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Sim, é castrado/esterilizado</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 text-gray-700 bg-white/50 border border-white/20 rounded-glass hover:bg-white/70 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-glass font-medium hover:from-coral-600 hover:to-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Salvando...</span>
                      </div>
                    ) : (
                      'Salvar Pet'
                    )}
                  </motion.button>
                </div>
              </form>
            </GlassContainer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}