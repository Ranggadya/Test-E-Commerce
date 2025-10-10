// src/types/order.types.ts
import { OrderStatus } from '@prisma/client';

// Input untuk membuat order baru
export type CreateOrderInput = {
  shippingAddress: string;
  note?: string;        // opsional, misal catatan untuk pengiriman
};

// Input untuk update status order
export type UpdateOrderStatusInput = {
  status: OrderStatus;
};

// Bisa juga buat type response jika ingin konsisten
export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type OrderResponse = {
  id: string;
  orderNumber: string;
  userId: string;
  shippingAddress: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
};
