import React from 'react'
import { motion } from 'framer-motion'
import { 
  CameraIcon, 
  PhotoIcon, 
  XMarkIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
  isLoading?: boolean
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onCapture,
  onClose,
  isLoading = false
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null)
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      })
      
      setStream(mediaStream)
      setHasPermission(true)
      setError(null)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setHasPermission(false)
      setError('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0)

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setCapturedImage(imageData)
    }
    reader.readAsDataURL(file)
  }

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-glass">
        <CameraIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Câmera não disponível
        </h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          {error || 'Permissão para câmera negada'}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={startCamera}
            className="flex items-center space-x-2 px-4 py-2 bg-coral-500 text-white rounded-glass hover:bg-coral-600 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Tentar novamente</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-glass hover:bg-teal-600 transition-colors"
          >
            <PhotoIcon className="h-4 w-4" />
            <span>Carregar foto</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="relative bg-black rounded-glass overflow-hidden">
      {/* Video/Image Display */}
      <div className="relative aspect-video">
        {capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured food"
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Camera overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanning frame */}
          <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-coral-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-coral-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-coral-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-coral-500 rounded-br-lg"></div>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {capturedImage ? 'Imagem capturada' : 'Posicione o alimento no centro'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        {capturedImage ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={retakePhoto}
              className="flex items-center justify-center w-12 h-12 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={confirmCapture}
              disabled={isLoading}
              className={`flex items-center justify-center w-16 h-16 rounded-full transition-colors ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-coral-500 hover:bg-coral-600'
              } text-white`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <CheckIcon className="h-6 w-6" />
              )}
            </motion.button>
          </>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-12 h-12 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors"
            >
              <PhotoIcon className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              className="flex items-center justify-center w-16 h-16 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors border-4 border-gray-300"
            >
              <CameraIcon className="h-8 w-8" />
            </motion.button>
          </>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="flex items-center justify-center w-12 h-12 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}