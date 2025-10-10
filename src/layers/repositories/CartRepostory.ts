import { prisma } from '@/lib/prisma';

export class CartRepository {
  async findByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async createCart(userId: string) {
    return prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async addItem(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId, productId },
      },
      create: {
        cartId,
        productId,
        quantity,
      },
      update: {
        quantity: { increment: quantity },
      },
      include: {
        product: true,
      },
    });
  }

  async updateItemQuantity(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.update({
      where: {
        cartId_productId: { cartId, productId },
      },
      data: { quantity },
      include: {
        product: true,
      },
    });
  }

  async removeItem(cartId: string, productId: string) {
    return prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId, productId },
      },
    });
  }

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }

  async findCartItem(cartId: string, productId: string) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId, productId },
      },
      include: {
        product: true,
      },
    });
  }
}