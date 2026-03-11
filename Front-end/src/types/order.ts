import type { Product } from "./product"

export interface OrderProduct {

  productId: Product

  quantity: number

  price: number
}

export interface Order {

  _id: string

  products: OrderProduct[]

  totalPrice: number

  status: "pending" | "completed" | "cancelled"

  cancelReason?: string
}