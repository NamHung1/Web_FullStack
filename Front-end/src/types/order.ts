import type { Product } from './product';

export interface Review {
  _id: string;
  userId: string | { _id: string; name?: string; email?: string };
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface OrderProduct {
  productId: Product;
  quantity: number;
  price: number;
  review?: Review | null;
}

export interface Order {
  _id: string;
  products: OrderProduct[];
  totalPrice: number;
  shippingAddress: string;
  phone: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'momo';
  status: 'pending' | 'completed' | 'cancelled';
  cancelReason?: string;
  createdAt?: string;
}
