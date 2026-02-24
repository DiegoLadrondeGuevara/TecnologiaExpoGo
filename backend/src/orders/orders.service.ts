import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    async create(
        userId: string,
        data: {
            items: { productId: string; quantity: number }[];
            currency: string;
            exchangeRate: number;
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
                throw new Error(`Insufficient stock for ${product.nameEn}`);
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

        // Create order with items in a transaction
        const order = await this.prisma.$transaction(async (tx) => {
            const created = await tx.order.create({
                data: {
                    userId,
                    subtotal,
                    tax,
                    total,
                    currency: data.currency,
                    exchangeRate: data.exchangeRate,
                    items: { create: orderItems },
                },
                include: { items: { include: { product: true } } },
            });

            // Decrement stock
            for (const item of data.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            return created;
        });

        return order;
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
}
