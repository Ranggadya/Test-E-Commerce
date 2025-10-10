import { prisma } from '../../lib/prisma';
import { OrderStatus } from '@/generated/prisma';
import { CreateOrderInput } from '@/types/OrderType';


export class OrderRepostory {
    async findAllOrders(userId?: string, page: number = 1, limit: number = 20) {
        const where = userId ? { userId } : {};
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrl: true,
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.order.count({ where }),
        ]);

        return { orders, total, page, limit };
    }

    async findOrderById(id: string) {
        return prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                                slug: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async createOrder(
        userId: string,
        orderData: CreateOrderInput,
        items: Array<{ productId: string; quantity: number; price: number }>,
        totalAmount: number
    ) {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        return prisma.order.create({
            data: {
                userId,
                orderNumber,
                shippingAddress: orderData.shippingAddress,
                totalAmount,
                items: {
                    create: items.map((item) => ({
                        quantity: item.quantity,
                        price: item.price,
                        product: {
                            connect: { id: String(item.productId) },
                        },
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        return prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                user: true,
            },
        });
    }
}