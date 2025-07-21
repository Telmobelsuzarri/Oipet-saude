import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/services/ecommerceService'
import { ecommerceAnalytics } from '@/services/ecommerceAnalytics'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (product: Product, quantity?: number, selectedWeight?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemCount: (productId: string) => number
  
  // E-commerce integration
  redirectToOiPetCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, selectedWeight) => {
        // Track analytics
        ecommerceAnalytics.trackAddToCart(product.id, product.name, quantity, product.price)
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => 
              item.product.id === product.id && 
              item.selectedWeight === selectedWeight
          )

          if (existingItemIndex > -1) {
            // Update existing item
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += quantity
            return { items: updatedItems }
          } else {
            // Add new item
            const newItem: CartItem = {
              product,
              quantity,
              selectedWeight
            }
            return { items: [...state.items, newItem] }
          }
        })
      },

      removeItem: (productId) => {
        const state = get()
        const item = state.items.find(item => item.product.id === productId)
        
        if (item) {
          ecommerceAnalytics.trackRemoveFromCart(item.product.id, item.product.name, item.quantity, item.product.price)
        }
        
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      toggleCart: () => {
        const state = get()
        if (!state.isOpen) {
          ecommerceAnalytics.trackCartView()
        }
        set((state) => ({ isOpen: !state.isOpen }))
      },

      setCartOpen: (open) => {
        set({ isOpen: open })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + (item.product.price * item.quantity), 
          0
        )
      },

      getItemCount: (productId) => {
        const item = get().items.find(item => item.product.id === productId)
        return item ? item.quantity : 0
      },

      redirectToOiPetCart: () => {
        const items = get().items
        if (items.length === 0) return
        
        // Track analytics
        const cartItems = items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
        
        ecommerceAnalytics.trackCheckoutStart(cartItems)
        ecommerceAnalytics.trackRedirectToOiPet(cartItems)
        
        // Build cart URL with items
        const cartData = items.map(item => ({
          id: item.product.id,
          quantity: item.quantity,
          weight: item.selectedWeight
        }))
        
        // Redirect to OiPet store with cart data
        const cartUrl = `https://oipetcomidadeverdade.com.br/cart?items=${encodeURIComponent(JSON.stringify(cartData))}`
        window.open(cartUrl, '_blank')
      }
    }),
    {
      name: 'oipet-cart-storage'
    }
  )
)