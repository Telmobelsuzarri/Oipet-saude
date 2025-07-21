import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CameraIcon,
  PhotoIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

import { GlassContainer, GlassCard, GlassWidget } from '@/components/ui/GlassContainer'
import { aiService, type FoodRecognitionResult } from '@/services/aiService'
import { cn } from '@/lib/utils'

interface ScanResult extends FoodRecognitionResult {
  imageUrl: string
  timestamp: Date
}

export const FoodScannerPage: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [history, setHistory] = useState<ScanResult[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
      return
    }

    setIsScanning(true)
    setError(null)
    setResult(null)

    try {
      // Criar preview da imagem
      const imageUrl = URL.createObjectURL(file)
      
      // Reconhecer alimento usando AI
      const recognition = await aiService.recognizeFood(file)
      
      const scanResult: ScanResult = {
        ...recognition,
        imageUrl,
        timestamp: new Date()
      }
      
      setResult(scanResult)
      setHistory(prev => [scanResult, ...prev.slice(0, 4)]) // Manter apenas 5 últimos
      
    } catch (err) {
      setError('Erro ao analisar a imagem. Tente novamente.')
      console.error('Erro no scanner:', err)
    } finally {
      setIsScanning(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const resetScan = () => {
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const getHealthScoreColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-600' : 'text-red-600'
  }

  const getHealthScoreIcon = (isHealthy: boolean) => {
    return isHealthy ? CheckCircleIcon : ExclamationTriangleIcon
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className="p-3 bg-coral-500 rounded-glass">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Scanner de Alimentos 🔍
            </h1>
          </motion.div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use inteligência artificial para identificar se um alimento é seguro para o seu pet. 
            Tire uma foto ou faça upload de uma imagem.
          </p>
        </div>

        {/* Scanner Interface */}
        <GlassCard className="mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Analisar Alimento
            </h2>

            {/* Upload Zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-glass p-8 transition-all",
                dragActive 
                  ? "border-coral-500 bg-coral-50" 
                  : "border-gray-300 hover:border-coral-400",
                isScanning && "opacity-50 pointer-events-none"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {isScanning ? (
                <div className="space-y-4">
                  <div className="animate-spin mx-auto">
                    <ArrowPathIcon className="h-12 w-12 text-coral-500" />
                  </div>
                  <p className="text-gray-600">Analisando alimento...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-center space-x-4">
                    <div className="p-4 bg-gray-100 rounded-glass">
                      <CameraIcon className="h-12 w-12 text-gray-600" />
                    </div>
                    <div className="p-4 bg-gray-100 rounded-glass">
                      <PhotoIcon className="h-12 w-12 text-gray-600" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Selecione uma imagem do alimento
                    </p>
                    <p className="text-gray-600">
                      Arraste uma imagem aqui ou clique nos botões abaixo
                    </p>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center space-x-2 bg-coral-500 text-white px-6 py-3 rounded-glass hover:bg-coral-600 transition-colors"
                    >
                      <CameraIcon className="h-5 w-5" />
                      <span>Câmera</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-glass border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <PhotoIcon className="h-5 w-5" />
                      <span>Galeria</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
          </div>
        </GlassCard>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <GlassCard className="border-red-200 bg-red-50">
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  <p className="text-red-800">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto p-1 text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Result Header */}
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={result.imageUrl}
                      alt="Alimento analisado"
                      className="w-20 h-20 object-cover rounded-glass"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {result.foodName}
                      </h3>
                      <p className="text-gray-600">
                        Confiança: {(result.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-glass",
                      result.isHealthyForPets 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    )}>
                      {React.createElement(getHealthScoreIcon(result.isHealthyForPets), {
                        className: "h-5 w-5"
                      })}
                      <span className="font-medium">
                        {result.isHealthyForPets ? 'Seguro' : 'Perigoso'}
                      </span>
                    </div>
                    
                    <button
                      onClick={resetScan}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-glass transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </GlassCard>

              {/* Recommendations & Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recommendations */}
                {result.recommendations.length > 0 && (
                  <GlassCard className="border-green-200 bg-green-50">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        <h4 className="font-semibold text-green-800">Recomendações</h4>
                      </div>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2 text-green-700">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <GlassCard className="border-red-200 bg-red-50">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                        <h4 className="font-semibold text-red-800">Avisos</h4>
                      </div>
                      <ul className="space-y-2">
                        {result.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start space-x-2 text-red-700">
                            <span className="text-red-500 mt-1">⚠️</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlassCard>
                )}
              </div>

              {/* Nutritional Info */}
              <GlassCard>
                <h4 className="font-semibold text-gray-900 mb-4">
                  Informações Nutricionais (por 100g)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(result.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-glass">
                      <p className="text-2xl font-bold text-coral-600">{value}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {key === 'calories' ? 'Calorias' :
                         key === 'protein' ? 'Proteína (g)' :
                         key === 'carbs' ? 'Carboidratos (g)' :
                         key === 'fat' ? 'Gordura (g)' :
                         key === 'fiber' ? 'Fibra (g)' :
                         key === 'calcium' ? 'Cálcio (mg)' :
                         'Fósforo (mg)'}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Scans */}
        {history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Análises Recentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((scan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassWidget className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setResult(scan)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={scan.imageUrl}
                        alt={scan.foodName}
                        className="w-12 h-12 object-cover rounded-glass"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{scan.foodName}</p>
                        <p className="text-sm text-gray-500">
                          {scan.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        scan.isHealthyForPets ? "bg-green-500" : "bg-red-500"
                      )} />
                    </div>
                  </GlassWidget>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}