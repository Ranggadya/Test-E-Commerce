import { OrderRepository } from "@/layers/repositories/OrderRepository";
import { ProductRepository } from "@/layers/repositories/ProductRepostory";
import { CartRepository } from "@/layers/repositories/CartRepostory";
import { AppError } from "@/exceptions/AppError";
import { OrderStatus } from "@prisma/client";
import { CreateOrderInput } from "@/types/OrderType";

export class OrderService {
  private readonly orderRepo = new OrderRepository();
  private readonly productRepo = new ProductRepository();
  private readonly cartRepo = new CartRepository();

  private readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.SHIPPED], // ✅ ditambahkan
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  async listMine(userId: string, page = 1, limit = 20) {
    if (!userId) throw new AppError("User ID wajib diisi", 400);
    return this.orderRepo.findAllOrders(userId, page, limit);
  }

  async listAll(page = 1, limit = 20, status?: OrderStatus) {
    return this.orderRepo.findAllOrders(undefined, page, limit, status);
  }

  async get(orderId: string) {
    if (!orderId) throw new AppError("Order ID wajib diisi", 400);

    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new AppError("Pesanan tidak ditemukan", 404);

    return order;
  }

  async checkout(userId: string, orderData: CreateOrderInput) {
    if (!userId) throw new AppError("User ID wajib diisi", 400);

    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart || cart.items.length === 0)
      throw new AppError("Keranjang Anda kosong", 400);

    const productIds = cart.items.map((item) => item.productId);
    const products = await Promise.all(
      productIds.map((id) => this.productRepo.findById(id))
    );

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = products[i];
      if (!product)
        throw new AppError(`Produk tidak ditemukan: ${item.productId}`, 404);
      if (product.stock < item.quantity)
        throw new AppError(`Stok tidak mencukupi untuk ${product.name}`, 400);
    }

    const items = cart.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      price: Number(it.product.price),
    }));

    const totalAmount = items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    const order = await this.orderRepo.createOrder(
      userId,
      orderData,
      items,
      totalAmount
    );

    await Promise.all(
      order.items.map((item) =>
        this.productRepo.adjustStock(item.productId, -item.quantity)
      )
    );

    await this.cartRepo.clear(cart.id);

    return {
      message: "Pesanan berhasil dibuat",
      order,
    };
  }

  async updateStatus(orderId: string, newStatus: OrderStatus) {
    if (!orderId) throw new AppError("Order ID wajib diisi", 400);

    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new AppError("Pesanan tidak ditemukan", 404);

    const allowedTransitions = this.ALLOWED_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new AppError(
        `Perubahan status tidak valid: ${order.status} → ${newStatus}`,
        400
      );
    }

    if (newStatus === OrderStatus.CANCELLED) {
      await Promise.all(
        order.items.map((item) =>
          this.productRepo.adjustStock(item.productId, item.quantity)
        )
      );
    }

    const updatedOrder = await this.orderRepo.updateStatus(orderId, newStatus);

    return {
      message: `Status pesanan berhasil diubah menjadi ${newStatus}`,
      order: updatedOrder,
    };
  }
}
