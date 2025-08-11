import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { PhotoIcon, CameraIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { CameraIcon as CameraSolid } from '@heroicons/react/24/solid'

import { GlassContainer, GlassCard } from '@/components/ui/GlassContainer'
import { usePetStore } from '@/stores/petStore'
import { 
  foodGalleryService, 
  type FoodPhoto, 
  type FoodGalleryStats 
} from '@/services/foodGalleryService'
import { challengeService } from '@/services/challengeService'
import { RequirementType } from '@/types/challenges'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'food'

export const FoodGalleryPage: React.FC = () => {
  console.log('FoodGalleryPage rendering...')
  
  const [selectedPetId, setSelectedPetId] = useState<string>('')
  const [photos, setPhotos] = useState<FoodPhoto[]>([])
  const [stats, setStats] = useState<FoodGalleryStats | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const [selectedPhotoForAction, setSelectedPhotoForAction] = useState<FoodPhoto | null>(null)
  const [form, setForm] = useState({
    type: 'snack' as FoodPhoto['mealType'],
    caption: '',
    hasStock: false,
    quantity: '',
    unit: 'pacotes',
    alert: ''
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { pets } = usePetStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0]._id)
    }
  }, [pets, selectedPetId])

  useEffect(() => {
    if (selectedPetId) {
      loadPhotos()
      loadStats()
      loadNotifications()
    }
  }, [selectedPetId])

  const loadNotifications = () => {
    try {
      const storedNotifications = localStorage.getItem('oipet_notifications')
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications)
        // Filter stock notifications for selected pet
        const stockNotifications = allNotifications.filter((n: any) => 
          n.type === 'stock_alert' && n.petId === selectedPetId && !n.read
        )
        setNotifications(stockNotifications)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadPhotos = () => {
    if (!selectedPetId) return
    
    try {
      const petPhotos = foodGalleryService.getPhotosByPet(selectedPetId)
      setPhotos(petPhotos)
      console.log('Loaded photos:', petPhotos.length)
    } catch (error) {
      console.error('Error loading photos:', error)
    }
  }

  const loadStats = () => {
    if (!selectedPetId) return
    
    try {
      const petStats = foodGalleryService.getGalleryStats(selectedPetId)
      setStats(petStats)
      console.log('Loaded stats:', petStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const selectedPet = pets.find(p => p._id === selectedPetId)
  console.log('Selected pet:', selectedPet)
  console.log('Pets:', pets.length)

  const openModal = (blob: Blob) => {
    setCurrentBlob(blob)
    setForm({
      type: 'snack',
      caption: `Alimento registrado em ${new Date().toLocaleDateString('pt-BR')}`,
      hasStock: false,
      quantity: '',
      unit: 'pacotes',
      alert: ''
    })
    setShowModal(true)
  }

  const savePhoto = async () => {
    if (!selectedPetId || !currentBlob) return

    try {
      let stockInfo = undefined
      if (form.hasStock && form.quantity) {
        stockInfo = {
          initialQuantity: parseInt(form.quantity),
          unit: form.unit,
          minimumAlert: form.alert ? parseInt(form.alert) : undefined
        }
      }

      await foodGalleryService.addPhoto(selectedPetId, currentBlob, {
        caption: form.caption,
        mealType: form.type,
        tags: ['novo'],
        stockInfo
      })

      // Integração com desafios semanais - atualizar progresso de fotos de alimentos
      if (user) {
        try {
          await challengeService.updateProgress(
            user.id,
            'food-photographer',
            RequirementType.FOOD_PHOTOS,
            1
          )
        } catch (error) {
          console.log('Challenge progress update error:', error)
        }
      }
      
      loadPhotos()
      loadStats()
      setShowModal(false)
      setCurrentBlob(null)
    } catch (error) {
      console.error('Error saving photo:', error)
      alert('Erro ao salvar foto')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      })
      setCameraStream(stream)
      setShowCamera(true)
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Não foi possível acessar a câmera')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        openModal(blob)
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }

  const handlePhotoClick = (photo: FoodPhoto) => {
    setSelectedPhotoForAction(photo)
    setShowPhotoOptions(true)
  }

  const consumeStock = async () => {
    if (!selectedPhotoForAction?.stockInfo || selectedPhotoForAction.stockInfo.currentQuantity <= 0) {
      alert('Não há estoque disponível para consumo')
      return
    }

    try {
      await foodGalleryService.consumeStock(selectedPhotoForAction.id, 1)
      loadPhotos()
      loadStats()
      setTimeout(loadNotifications, 500)
      setShowPhotoOptions(false)
      setSelectedPhotoForAction(null)
    } catch (error) {
      console.error('Error consuming stock:', error)
      alert('Erro ao consumir estoque')
    }
  }

  const deletePhoto = async () => {
    if (!selectedPhotoForAction) return

    const confirmed = confirm(`Tem certeza que deseja apagar "${selectedPhotoForAction.caption || 'esta foto'}"?`)
    if (confirmed) {
      try {
        await foodGalleryService.deletePhoto(selectedPhotoForAction.id)
        loadPhotos()
        loadStats()
        setShowPhotoOptions(false)
        setSelectedPhotoForAction(null)
      } catch (error) {
        console.error('Error deleting photo:', error)
        alert('Erro ao apagar foto')
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <PhotoIcon className="h-8 w-8 text-coral-500 mr-3" />
              Galeria de Alimentação
            </h1>
            <p className="text-gray-600 mt-1">
              Registre e acompanhe a alimentação do seu pet
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCamera}
              className="flex items-center space-x-2 bg-coral-500 text-white px-4 py-2 rounded-glass hover:bg-coral-600 transition-colors"
            >
              <CameraSolid className="h-5 w-5" />
              <span>Fotografar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) openModal(file)
                }
                input.click()
              }}
              className="flex items-center space-x-2 bg-teal-500 text-white px-4 py-2 rounded-glass hover:bg-teal-600 transition-colors"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              <span>Upload</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Pet Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Selecionar Pet
              </h2>
              <p className="text-gray-600">
                Escolha o pet para visualizar a galeria de alimentação
              </p>
            </div>
            
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="px-4 py-3 bg-white/50 border border-gray-200 rounded-glass focus:ring-2 focus:ring-coral-500 focus:border-transparent text-lg font-medium"
            >
              <option value="">Selecione um pet</option>
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name} ({pet.species})
                </option>
              ))}
            </select>
          </div>
        </GlassCard>
      </motion.div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  ⚠️ Alertas de Estoque
                </h3>
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="text-sm text-yellow-700">
                      • {notif.message}
                    </div>
                  ))}
                </div>
              </div>
              <a
                href={`https://api.whatsapp.com/message/VLVM27HUDJIEJ1?autoload=1&app_absent=0&text=Olá! Preciso repor alimentos para meu pet. Vi pelo app que alguns itens estão acabando.`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm hover:bg-green-600 transition-colors whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Pedir no WhatsApp</span>
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Fotos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPhotos}</p>
                </div>
                <div className="p-3 bg-coral-100 text-coral-600 rounded-glass">
                  <PhotoIcon className="h-6 w-6" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Esta Semana</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.photosThisWeek}</p>
                </div>
                <div className="p-3 bg-teal-100 text-teal-600 rounded-glass">
                  <PhotoIcon className="h-6 w-6" />
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}

      {/* Simple Photo Grid */}
      {selectedPetId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.slice(0, 8).map((photo) => (
                <GlassCard key={photo.id} className="overflow-hidden cursor-pointer group">
                  <div 
                    className="aspect-square relative"
                    onClick={() => handlePhotoClick(photo)}>
                    <img
                      src={photo.imageUrl}
                      alt={photo.caption || 'Foto de alimento'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Stock Info */}
                    {photo.stockInfo && (
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                        photo.stockInfo.currentQuantity <= 0 ? 'bg-red-500 text-white' :
                        photo.stockInfo.currentQuantity <= photo.stockInfo.minimumAlert ? 'bg-yellow-500 text-white' :
                        'bg-teal-500 text-white'
                      }`}>
                        <span>📦</span>
                        <span>{photo.stockInfo.currentQuantity} {photo.stockInfo.unit}</span>
                        {photo.stockInfo.currentQuantity <= photo.stockInfo.minimumAlert && (
                          <span>⚠️</span>
                        )}
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 text-white text-xs font-medium">
                      {photo.timestamp.toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  {photo.caption && (
                    <div className="p-4">
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-12">
              <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma foto ainda
              </h3>
              <p className="text-gray-600 mb-4">
                Comece fotografando as refeições do seu pet
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-coral-500 text-white px-6 py-3 rounded-glass hover:bg-coral-600 transition-colors mx-auto"
              >
                <CameraIcon className="h-5 w-5" />
                <span>Fotografar Agora</span>
              </motion.button>
            </GlassCard>
          )}
        </motion.div>
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
        Debug: {pets.length} pets, {photos.length} photos, selectedPetId: {selectedPetId}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <h3 className="font-semibold">Fotografar Alimento</h3>
              <button
                onClick={stopCamera}
                className="text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="relative bg-black aspect-square">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center justify-center">
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all transform hover:scale-105"
                  >
                    <div className="w-14 h-14 bg-coral-500 rounded-full" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Modal */}
      {showModal && currentBlob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-6 pb-0">
              <h3 className="text-xl font-bold mb-4">📸 Detalhes da Foto</h3>
              
              <div className="mb-4">
                <img
                  src={URL.createObjectURL(currentBlob)}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="px-6 pb-6 overflow-y-auto flex-1">
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'breakfast', label: '🌅 Café' },
                    { value: 'lunch', label: '🍽️ Almoço' },
                    { value: 'dinner', label: '🌙 Jantar' },
                    { value: 'snack', label: '🥨 Petisco' },
                    { value: 'food', label: '🍖 Alimentação' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setForm(prev => ({ ...prev, type: option.value as any }))}
                      className={`px-3 py-1 rounded text-sm ${
                        form.type === option.value ? 'bg-coral-500 text-white' : 'bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={form.caption}
                  onChange={(e) => setForm(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-coral-500"
                  placeholder="Ex: Ração Premium"
                />
              </div>

              <div className="bg-teal-50 p-4 rounded">
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    id="stock"
                    checked={form.hasStock}
                    onChange={(e) => setForm(prev => ({ ...prev, hasStock: e.target.checked }))}
                  />
                  <label htmlFor="stock" className="text-sm font-medium">
                    📦 Controle de estoque
                  </label>
                </div>
                
                {form.hasStock && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Quantidade</label>
                        <input
                          type="number"
                          value={form.quantity}
                          onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="10"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Unidade</label>
                        <select
                          value={form.unit}
                          onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="pacotes">Pacotes</option>
                          <option value="latas">Latas</option>
                          <option value="kg">Quilos</option>
                          <option value="unidades">Unidades</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Alerta quando restarem
                      </label>
                      <input
                        type="number"
                        value={form.alert}
                        onChange={(e) => setForm(prev => ({ ...prev, alert: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="2"
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>

            {/* Fixed buttons at bottom */}
            <div className="p-6 pt-4 border-t border-gray-100 bg-white rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePhoto}
                  className="px-4 py-2 bg-coral-500 text-white rounded hover:bg-coral-600"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Options Modal */}
      {showPhotoOptions && selectedPhotoForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-center">
              {selectedPhotoForAction.caption || 'Foto de Alimento'}
            </h3>
            
            <div className="mb-4">
              <img
                src={selectedPhotoForAction.imageUrl}
                alt={selectedPhotoForAction.caption || 'Foto de alimento'}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>

            {/* Stock info if available */}
            {selectedPhotoForAction.stockInfo && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600 text-center">
                  <div className="font-semibold text-lg text-gray-800">
                    📦 {selectedPhotoForAction.stockInfo.currentQuantity} {selectedPhotoForAction.stockInfo.unit}
                  </div>
                  <div className="text-xs mt-1">
                    {selectedPhotoForAction.stockInfo.currentQuantity <= selectedPhotoForAction.stockInfo.minimumAlert ? (
                      <span className="text-yellow-600">⚠️ Estoque baixo</span>
                    ) : (
                      <span className="text-green-600">✅ Estoque normal</span>
                    )}
                  </div>
                </div>
                
                {/* WhatsApp button for low stock */}
                {selectedPhotoForAction.stockInfo.currentQuantity <= selectedPhotoForAction.stockInfo.minimumAlert && (
                  <div className="mt-3">
                    <a
                      href={`https://api.whatsapp.com/message/VLVM27HUDJIEJ1?autoload=1&app_absent=0&text=Olá! Gostaria de comprar mais ${selectedPhotoForAction.caption || 'alimento para pet'}. Vi pelo app que está com apenas ${selectedPhotoForAction.stockInfo.currentQuantity} ${selectedPhotoForAction.stockInfo.unit}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      <span>Repor pelo WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {/* Consume stock option */}
              {selectedPhotoForAction.stockInfo && selectedPhotoForAction.stockInfo.currentQuantity > 0 && (
                <button
                  onClick={consumeStock}
                  className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🍖</span>
                  <span>Consumir 1 {selectedPhotoForAction.stockInfo.unit}</span>
                </button>
              )}

              {/* Delete photo option */}
              <button
                onClick={deletePhoto}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🗑️</span>
                <span>Apagar Foto</span>
              </button>

              {/* Cancel option */}
              <button
                onClick={() => {
                  setShowPhotoOptions(false)
                  setSelectedPhotoForAction(null)
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}