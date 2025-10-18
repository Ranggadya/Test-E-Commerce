import { OrderRepository } from "@/layers/repositories/OrderRepository";
import { ProductRepository } from "@/layers/repositories/ProductRepostory";
import { CartRepository } from "@/layers/repositories/CartRepostory";
import { AppError } from "@/exceptions/AppError";
import { OrderStatus, Prisma } from "@prisma/client";
import { CreateOrderInput } from "@/types/OrderType";

export class OrderService {
  private readonly orderRepo = new OrderRepository();
  private readonly productRepo = new ProductRepository();
  private readonly cartRepo = new CartRepository();

  // 🔒 Definisi transisi status valid
  private readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  /**
   * 🧾 Ambil semua order milik user
   */
  async listMine(userId: string, page = 1, limit = 20) {
    if (!userId) throw new AppError("User ID is required", 400);
    return this.orderRepo.findAllOrders(userId, page, limit);
  }

  /**
   * 🧾 Ambil semua order (admin)
   */
  async listAll(page = 1, limit = 20, status?: OrderStatus) {
    return this.orderRepo.findAllOrders(undefined, page, limit, status);
  }

  /**
   * 🔍 Ambil detail 1 order berdasarkan ID
   */
  async get(id: string) {
    if (!id) throw new AppError("Order ID is required", 400);

    const order = await this.orderRepo.findOrderById(id);
    if (!order) throw new AppError("Order not found", 404);

    return order;
  }

  /**
   * 💳 Checkout: buat pesanan baru dari isi keranjang user
   */
  async checkout(userId: string, orderData: CreateOrderInput) {
    if (!userId) throw new AppError("User ID is required", 400);

    const cart = await this.cartRepo.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty", 400);
    }

    // 🔎 Validasi stok semua produk sekaligus
    const productIds = cart.items.map((item) => item.productId);
    const products = await Promise.all(
      productIds.map((id) => this.productRepo.findById(id))
    );

    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i];
      const product = products[i];
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }
    }

    // 🧮 Siapkan daftar item & total
    const items = cart.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      price: Number(it.product.price),
    }));

    const totalAmount = items.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    // 🧾 Buat order baru
    const order = await this.orderRepo.createOrder(
      userId,
      orderData,
      items,
      totalAmount
    );

    // 📉 Kurangi stok produk secara atomik
    await Promise.all(
      order.items.map((item) =>
        this.productRepo.adjustStock(item.productId, -item.quantity)
      )
    );

    // 🗑️ Kosongkan keranjang setelah berhasil checkout
    await this.cartRepo.clear(cart.id);

    return {
      message: "Order successfully created",
      order,
    };
  }

  /**
   * ⚙️ Update status order (admin)
   */
  async updateStatus(id: string, status: OrderStatus) {
    if (!id) throw new AppError("Order ID is required", 400);

    const order = await this.orderRepo.findOrderById(id);
    if (!order) throw new AppError("Order not found", 404);

    const allowed = this.ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(status)) {
      throw new AppError(
        `Invalid status transition: ${order.status} → ${status}`,
        400
      );
    }

    // 🔁 Jika dibatalkan → kembalikan stok
    if (status === OrderStatus.CANCELLED) {
      await Promise.all(
        order.items.map((item) =>
          this.productRepo.adjustStock(item.productId, item.quantity)
        )
      );
    }

    const updatedOrder = await this.orderRepo.updateStatus(id, status);
    return {
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    };
  }
}
