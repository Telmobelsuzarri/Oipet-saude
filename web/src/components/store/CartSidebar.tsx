import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

import { GlassContainer } from '@/components/ui/GlassContainer'
import { useCartStore } from '@/stores/cartStore'
import { ecommerceService } from '@/services/ecommerceService'
import { cn } from '@/lib/utils'

export const CartSidebar: React.FC = () => {
  const {
    items,
    isOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
    redirectToOiPetCart
  } = useCartStore()

  const total = getTotalPrice()
  const itemCount = getTotalItems()

  const handleCheckout = () => {
    ecommerceService.redirectToOiPetCart(items)
    setCartOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-96 max-w-full z-50"
          >
            <GlassContainer className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/20">
                <div className="flex items-center space-x-3">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Carrinho
                  </h2>
                  {itemCount > 0 && (
                    <span className="bg-coral-500 text-white text-sm font-bold px-2 py-1 rounded-glass">
                      {itemCount}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCartOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-glass hover:bg-white/20 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {items.length === 0 ? (
                  /* Empty State */
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center">
                      <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Carrinho vazio
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Adicione produtos da loja OiPet
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCartOpen(false)}
                        className="bg-coral-500 text-white px-6 py-2 rounded-glass hover:bg-coral-600 transition-colors"
                      >
                        Continuar comprando
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {items.map((item) => (
                        <motion.div
                          key={`${item.product.id}-${item.selectedWeight || 'default'}`}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="bg-white/30 backdrop-blur-sm rounded-glass border border-white/20 p-4"
                        >
                          <div className="flex space-x-4">
                            {/* Product Image */}
                            <div className="w-16 h-16 bg-gray-200 rounded-glass overflow-hidden flex-shrink-0">
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {item.product.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {ecommerceService.formatPrice(item.product.price)}
                                {item.selectedWeight && ` • ${item.selectedWeight}`}
                              </p>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="p-1 bg-gray-200 rounded-glass hover:bg-gray-300 transition-colors"
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </motion.button>
                                  
                                  <span className="w-8 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="p-1 bg-gray-200 rounded-glass hover:bg-gray-300 transition-colors"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </motion.button>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeItem(item.product.id)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded-glass transition-colors"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200/20 p-6 space-y-4">
                      {/* Total */}
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-coral-600">
                          {ecommerceService.formatPrice(total)}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCheckout}
                          className="w-full flex items-center justify-center space-x-2 bg-coral-500 text-white py-3 px-4 rounded-glass hover:bg-coral-600 transition-colors font-medium"
                        >
                          <span>Finalizar na OiPet</span>
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </motion.button>

                        <div className="flex space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCartOpen(false)}
                            className="flex-1 bg-white/50 text-gray-700 py-2 px-4 rounded-glass border border-gray-200 hover:bg-white/70 transition-colors"
                          >
                            Continuar
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={clearCart}
                            className="flex-1 bg-red-500/10 text-red-600 py-2 px-4 rounded-glass border border-red-200 hover:bg-red-500/20 transition-colors"
                          >
                            Limpar
                          </motion.button>
                        </div>
                      </div>

                      {/* Note */}
                      <p className="text-xs text-gray-500 text-center">
                        Você será redirecionado para a loja oficial OiPet para finalizar a compra
                      </p>
                    </div>
                  </>
                )}
              </div>
            </GlassContainer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}