import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
    constructor(
        private prisma: PrismaService,
        private notifications: NotificationsService,
    ) { }

    async create(
        userId: string,
        data: {
            items: { productId: string; quantity: number }[];
            currency: string;
            exchangeRate: number;
            shippingAddress?: string;
        },
    ) {
        // Fetch products and validate stock
        const products = await this.prisma.product.findMany({
            where: { id: { in: data.items.map((i) => i.productId) } },
        });

        let subtotal = 0;
        const orderItems = data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Insufficient stock for ${product.nameEn}`);
            }
            const lineTotal = product.price * item.quantity;
            subtotal += lineTotal;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            };
        });

        // Get tax rate from config
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { empresa: { include: { config: true } } },
        });
        const taxRate = user?.empresa?.config?.taxRate ?? 0.16;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        // Create order with items (NO stock decrement here — done on payment webhook)
        const order = await this.prisma.order.create({
            data: {
                userId,
                subtotal,
                tax,
                total,
                currency: data.currency,
                exchangeRate: data.exchangeRate,
                shippingAddress: data.shippingAddress || null,
                items: { create: orderItems },
            },
            include: { items: { include: { product: true } } },
        });

        return order;
    }

    /**
     * Cancel a pending order.
     * Only the owner can cancel, and only if the order is still 'pending'.
     */
    async cancelOrder(orderId: string, userId: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new ForbiddenException('You can only cancel your own orders');
        }

        if (order.status !== 'pending') {
            throw new BadRequestException('Only pending orders can be cancelled');
        }

        // Delete related payment record if exists, then order items, then order
        await this.prisma.$transaction(async (tx) => {
            if (order.payment) {
                await tx.payment.delete({ where: { id: order.payment.id } });
            }
            await tx.orderItem.deleteMany({ where: { orderId } });
            await tx.order.delete({ where: { id: orderId } });
        });

        return { cancelled: true, orderId };
    }

    async findAll(userId: string, role: string) {
        const where = role === 'ADMIN' ? {} : { userId };
        return this.prisma.order.findMany({
            where,
            include: {
                items: { include: { product: true } },
                payment: true,
                user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Update order status (admin only).
     * Sends push notification for shipped, delivered, cancelled.
     */
    async updateStatus(orderId: string, newStatus: string) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });

        if (!order) throw new NotFoundException('Order not found');

        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: {
                items: { include: { product: true } },
                payment: true,
                user: { select: { name: true, email: true } },
            },
        });

        // Send push notification for key statuses
        if (['shipped', 'delivered', 'cancelled'].includes(newStatus) && order.user.expoPushToken) {
            await this.notifications.sendOrderStatusPush(
                order.user.expoPushToken,
                orderId,
                newStatus,
            );
        }

        return updated;
    }
}
