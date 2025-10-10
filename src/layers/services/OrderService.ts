import { OrderRepostory } from '@/layers/repositories/OrderRepository';
import { ProductRepository } from '@/layers/repositories/ProductRepostory';
import { CartRepository } from '@/layers/repositories/CartRepostory';
import { AppError } from '@/exceptions/AppError';
import { OrderStatus } from '@prisma/client';
import { CreateOrderInput } from '@/types/OrderType';

const orderRepo = new OrderRepostory();
const productRepo = new ProductRepository();
const cartRepo = new CartRepository();

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export const orderService = {
  /** List orders of a specific user */
  listMine: (userId: string, page: number = 1, limit: number = 20) =>
    orderRepo.findAllOrders(userId, page, limit),

  /** Get single order by ID */
  get: async (id: string) => {
    const order = await orderRepo.findOrderById(id);
    if (!order) throw new AppError('Order not found', 404);
    return order;
  },

  /** Checkout flow */
  async checkout(userId: string, orderData: CreateOrderInput) {
    const cart = await cartRepo.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Preflight stock check
    for (const item of cart.items) {
      const product = await productRepo.findById(item.productId);
      if (!product) throw new AppError(`Product not found: ${item.productId}`, 404);
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }
    }

    // Prepare order items & total
    const items = cart.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      price: it.product.price,
    }));
    const totalAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    // Create order
    const order = await orderRepo.createOrder(userId, orderData, items, totalAmount);
    if (!order) throw new AppError('Unable to create order', 400);

    // Decrement stock atomically
    for (const item of order.items) {
      const updated = await productRepo.adjustStock(Number(item.productId), -item.quantity);
      if (!updated) {
        throw new AppError(
          `Concurrent stock change detected for product ${item.productId}. Please contact support.`,
          409
        );
      }
    }

    return order;
  },

  listAll: (page: number = 1, limit: number = 20, status?: OrderStatus) =>
    orderRepo.findAllOrders(undefined, page, limit),

  async updateStatus(id: string, status: OrderStatus) {
    const order = await orderRepo.findOrderById(id);
    if (!order) throw new AppError('Order not found', 404);

    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(status)) {
      throw new AppError(`Invalid transition ${order.status} → ${status}`, 400);
    }

    if (status === 'CANCELED') {
      for (const item of order.items) {
        await productRepo.adjustStock(Number(item.productId), +item.quantity);
      }
    }

    return orderRepo.updateStatus(id, status);
  },
};
