import { create } from "zustand"

import type { Product } from "../types/product"

interface CartItem {

  product: Product

  quantity: number

}

interface CartState {

  items: CartItem[]

  addToCart: (product: Product) => void

  remove: (id: string) => void

}

export const useCartStore = create<CartState>((set, get) => ({

  items: [],

  addToCart: (product) => {

    const items = get().items

    const existing = items.find(

      (i) => i.product._id === product._id
    )

    if (existing) {

      existing.quantity++

      set({ items: [...items] })

    } else {

      set({

        items: [...items, { product, quantity: 1 }]

      })

    }

  },

  remove: (id) => {

    set({

      items: get().items.filter(

        (i) => i.product._id !== id
      )

    })

  }

}))