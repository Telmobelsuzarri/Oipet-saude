import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  HomeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { GlassContainer } from '@/components/ui/GlassContainer'
import { ecommerceAnalytics } from '@/services/ecommerceAnalytics'

interface OiPetWebViewProps {
  isOpen: boolean
  onClose: () => void
  initialUrl?: string
}

export const OiPetWebView: React.FC<OiPetWebViewProps> = ({ 
  isOpen, 
  onClose,
  initialUrl = 'https://oipetcomidadeverdade.com.br'
}) => {
  const [url, setUrl] = useState(initialUrl)
  const [isLoading, setIsLoading] = useState(true)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Track analytics
      ecommerceAnalytics.trackEvent({
        event: 'webview_opened',
        properties: {
          url: initialUrl,
          source: 'store_page'
        }
      })
    }
  }, [isOpen, initialUrl])

  const handleClose = () => {
    ecommerceAnalytics.trackEvent({
      event: 'webview_closed',
      properties: {
        currentUrl: url,
        timeSpent: Date.now() - performance.now()
      }
    })
    onClose()
  }

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
      setIsLoading(true)
    }
  }

  const handleHome = () => {
    setUrl('https://oipetcomidadeverdade.com.br')
    if (iframeRef.current) {
      iframeRef.current.src = 'https://oipetcomidadeverdade.com.br'
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* WebView Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-4 md:inset-8 lg:inset-12 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassContainer className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/20">
            <div className="flex items-center space-x-4">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.history.back()}
                  disabled={!canGoBack}
                  className="p-2 rounded-glass hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => window.history.forward()}
                  disabled={!canGoForward}
                  className="p-2 rounded-glass hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleReload}
                  className="p-2 rounded-glass hover:bg-white/10 transition-colors"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleHome}
                  className="p-2 rounded-glass hover:bg-white/10 transition-colors"
                >
                  <HomeIcon className="h-5 w-5" />
                </button>
              </div>

              {/* URL Display */}
              <div className="flex-1 flex items-center space-x-2 bg-white/5 rounded-glass px-3 py-1">
                <ShoppingBagIcon className="h-4 w-4 text-coral-500" />
                <span className="text-sm text-gray-600 truncate">
                  {url.replace('https://', '').replace('www.', '')}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-glass hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute top-14 left-0 right-0 h-1 bg-gray-200/20">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="h-full bg-coral-500"
              />
            </div>
          )}

          {/* WebView Content */}
          <div className="flex-1 relative bg-white rounded-b-glass overflow-hidden">
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="OiPet Store"
            />

            {/* Fallback Message */}
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 pointer-events-none opacity-0">
              <div className="text-center p-8">
                <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Loja OiPet
                </h3>
                <p className="text-gray-600 mb-4">
                  Navegue pelo catálogo completo de produtos OiPet
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 hover:text-coral-700 font-medium"
                >
                  Abrir em nova aba →
                </a>
              </div>
            </div>
          </div>
        </GlassContainer>
      </motion.div>
    </>
  )
}