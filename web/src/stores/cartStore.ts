import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/services/ecommerce'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
  url: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (open: boolean) => void
  
  // Computed values
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemCount: (id: string) => number
  
  // E-commerce integration
  redirectToOiPetCart: () => void
}

export const cartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const quantity = item.quantity || 1
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (existingItem) => existingItem.id === item.id
          )

          if (existingItemIndex > -1) {
            // Update existing item
            const updatedItems = [...state.items]
            updatedItems[existingItemIndex].quantity += quantity
            return { items: updatedItems }
          } else {
            // Add new item
            const newItem: CartItem = {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity,
              imageUrl: item.imageUrl,
              url: item.url
            }
            return { items: [...state.items, newItem] }
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === id
              ? { ...item, quantity }
              : item
          )
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      toggleCart: () => {
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
          (total, item) => total + (item.price * item.quantity), 
          0
        )
      },

      getItemCount: (id) => {
        const item = get().items.find(item => item.id === id)
        return item ? item.quantity : 0
      },

      redirectToOiPetCart: () => {
        const items = get().items
        if (items.length === 0) return
        
        // Build cart URL with items
        const cartData = items.map(item => ({
          id: item.id,
          quantity: item.quantity
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