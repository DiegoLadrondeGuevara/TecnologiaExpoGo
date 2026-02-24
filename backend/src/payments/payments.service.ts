import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) { }

    async createPreference(
        userId: string,
        data: { orderId: string },
    ) {
        const order = await this.prisma.order.findUnique({
            where: { id: data.orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order) throw new NotFoundException('Order not found');

        // In production, call Mercado Pago SDK here to create a real preference
        // For now, simulate the preference creation
        const preferenceId = `PREF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const initPoint = `https://sandbox.mercadopago.com.pe/checkout/v1/redirect?pref_id=${preferenceId}`;

        const payment = await this.prisma.payment.create({
            data: {
                orderId: data.orderId,
                amount: order.total,
                currency: order.currency,
                mpPreferenceId: preferenceId,
                mpInitPoint: initPoint,
            },
        });

        return {
            id: preferenceId,
            init_point: initPoint,
            sandbox_init_point: initPoint,
            paymentId: payment.id,
        };
    }

    async findAll() {
        return this.prisma.payment.findMany({
            include: {
                order: {
                    include: {
                        user: { select: { name: true, email: true } },
                        items: { include: { product: true } },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }

    async handleWebhook(body: {
        action: string;
        data: { id: string };
    }) {
        // In production, verify Mercado Pago signature
        // and update payment status based on the webhook data
        if (body.action === 'payment.updated' || body.action === 'payment.created') {
            // Find payment by external ID and update status
            const payment = await this.prisma.payment.findFirst({
                where: { externalId: body.data.id },
            });
            if (payment) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'approved' },
                });
                // Also update order status
                await this.prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'paid' },
                });
            }
        }
        return { received: true };
    }
}
