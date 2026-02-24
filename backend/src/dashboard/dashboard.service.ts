import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats(empresaId: string) {
        const [totalProducts, activeUsers, payments, orders] = await Promise.all([
            this.prisma.product.count({ where: { empresaId } }),
            this.prisma.user.count({ where: { empresaId } }),
            this.prisma.payment.findMany({
                where: { status: 'approved' },
                select: { amount: true },
            }),
            this.prisma.order.count(),
        ]);

        const totalSales = payments.reduce((sum, p) => sum + p.amount, 0);

        const recentPayments = await this.prisma.payment.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            include: {
                order: {
                    include: {
                        user: { select: { name: true } },
                        items: { include: { product: { select: { nameEn: true } } } },
                    },
                },
            },
        });

        return {
            totalSales,
            totalOrders: orders,
            activeUsers,
            totalProducts,
            recentPayments: recentPayments.map((p) => ({
                id: p.id,
                orderId: p.orderId,
                userName: p.order.user.name,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                date: p.date,
                items: p.order.items.map((i) => i.product.nameEn),
            })),
        };
    }
}
