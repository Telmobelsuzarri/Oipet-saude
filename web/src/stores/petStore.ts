import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export interface Pet {
  _id: string
  userId: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  birthDate: string
  weight: number
  height: number
  gender: 'male' | 'female'
  isNeutered: boolean
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface PetState {
  pets: Pet[]
  selectedPet: Pet | null
  isLoading: boolean
  fetchPets: () => Promise<void>
  createPet: (petData: CreatePetData) => Promise<void>
  updatePet: (petId: string, petData: Partial<Pet>) => Promise<void>
  deletePet: (petId: string) => Promise<void>
  selectPet: (pet: Pet | null) => void
}

interface CreatePetData {
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  birthDate: string
  weight: number
  height: number
  gender: 'male' | 'female'
  isNeutered: boolean
  avatar?: string
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pets: [],
      selectedPet: null,
      isLoading: false,

      fetchPets: async () => {
        try {
          set({ isLoading: true })
          
          const response = await api.pets.getAll()
          const pets = response.data.data || []
          
          set({
            pets,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Erro ao carregar pets'
          toast.error(message)
          throw error
        }
      },

      createPet: async (petData: CreatePetData) => {
        try {
          set({ isLoading: true })
          
          const response = await api.pets.create(petData)
          const newPet = response.data.data
          
          const { pets } = get()
          set({
            pets: [...pets, newPet],
            isLoading: false,
          })
          
          toast.success(`Pet ${newPet.name} cadastrado com sucesso!`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Erro ao cadastrar pet'
          toast.error(message)
          throw error
        }
      },

      updatePet: async (petId: string, petData: Partial<Pet>) => {
        try {
          set({ isLoading: true })
          
          const response = await api.pets.update(petId, petData)
          const updatedPet = response.data.data
          
          const { pets, selectedPet } = get()
          const updatedPets = pets.map(pet => 
            pet._id === petId ? updatedPet : pet
          )
          
          set({
            pets: updatedPets,
            selectedPet: selectedPet?._id === petId ? updatedPet : selectedPet,
            isLoading: false,
          })
          
          toast.success(`Pet ${updatedPet.name} atualizado com sucesso!`)
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Erro ao atualizar pet'
          toast.error(message)
          throw error
        }
      },

      deletePet: async (petId: string) => {
        try {
          set({ isLoading: true })
          
          await api.pets.delete(petId)
          
          const { pets, selectedPet } = get()
          const updatedPets = pets.filter(pet => pet._id !== petId)
          
          set({
            pets: updatedPets,
            selectedPet: selectedPet?._id === petId ? null : selectedPet,
            isLoading: false,
          })
          
          toast.success('Pet removido com sucesso!')
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Erro ao remover pet'
          toast.error(message)
          throw error
        }
      },

      selectPet: (pet: Pet | null) => {
        set({ selectedPet: pet })
      },
    }),
    {
      name: 'pet-storage',
      partialize: (state) => ({
        pets: state.pets,
        selectedPet: state.selectedPet,
      }),
    }
  )
)