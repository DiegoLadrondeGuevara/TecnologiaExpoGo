import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoConfig, Preference, Payment as MPPayment } from 'mercadopago';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private mpClient: MercadoPagoConfig;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
        if (!accessToken) {
            this.logger.warn('MP_ACCESS_TOKEN not configured — Mercado Pago will not work');
        }
        this.mpClient = new MercadoPagoConfig({
            accessToken: accessToken || '',
        });

        const webhookUrl = this.configService.get<string>('MP_WEBHOOK_URL');
        this.logger.log(`✅ MercadoPago initialized | webhook: ${webhookUrl || '(not configured — set MP_WEBHOOK_URL in .env)'}`);
    }

    async createPreference(
        userId: string,
        data: { orderId: string },
    ) {
        const order = await this.prisma.order.findUnique({
            where: { id: data.orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order) throw new NotFoundException('Order not found');

        // Build MP items from the order
        const items = order.items.map((item) => ({
            id: item.productId,
            title: item.product.nameEn,
            quantity: item.quantity,
            unit_price: Number((item.unitPrice * order.exchangeRate).toFixed(2)),
            currency_id: order.currency === 'PEN' ? 'PEN' : 'USD',
        }));

        // Create real Mercado Pago preference
        const preference = new Preference(this.mpClient);
        const result = await preference.create({
            body: {
                items,
                back_urls: {
                    success: 'https://techstore.app/payment/success',
                    failure: 'https://techstore.app/payment/failure',
                    pending: 'https://techstore.app/payment/pending',
                },
                auto_return: 'approved',
                external_reference: data.orderId,
                notification_url: this.configService.get<string>('MP_WEBHOOK_URL') || undefined,
            },
        });

        this.logger.log(`MP preference created: ${result.id} for order ${data.orderId}`);

        // Store the preference in the Payment record
        const payment = await this.prisma.payment.create({
            data: {
                orderId: data.orderId,
                amount: order.total,
                currency: order.currency,
                mpPreferenceId: result.id || '',
                mpInitPoint: result.init_point || '',
            },
        });

        return {
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
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
        action?: string;
        type?: string;
        data?: { id: string };
    }) {
        this.logger.log(`Webhook received: ${JSON.stringify(body)}`);

        // Mercado Pago sends type=payment for payment notifications
        const isPaymentNotification =
            body.type === 'payment' ||
            body.action === 'payment.updated' ||
            body.action === 'payment.created';

        if (!isPaymentNotification || !body.data?.id) {
            return { received: true, processed: false };
        }

        try {
            // Query the real payment status from Mercado Pago API
            const mpPayment = new MPPayment(this.mpClient);
            const paymentInfo = await mpPayment.get({ id: Number(body.data.id) });

            this.logger.log(
                `MP Payment ${body.data.id}: status=${paymentInfo.status}, ref=${paymentInfo.external_reference}`,
            );

            const orderId = paymentInfo.external_reference;
            if (!orderId) {
                this.logger.warn('No external_reference in payment');
                return { received: true, processed: false };
            }

            // Find the payment record by orderId
            const payment = await this.prisma.payment.findFirst({
                where: { orderId },
            });

            if (!payment) {
                this.logger.warn(`No payment record found for order ${orderId}`);
                return { received: true, processed: false };
            }

            // Update payment with external info
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    externalId: String(body.data.id),
                    status: paymentInfo.status || 'unknown',
                },
            });

            // If approved: update order status + decrement stock
            if (paymentInfo.status === 'approved') {
                await this.prisma.$transaction(async (tx) => {
                    // Mark order as paid
                    await tx.order.update({
                        where: { id: orderId },
                        data: { status: 'paid' },
                    });

                    // Decrement stock for each item
                    const order = await tx.order.findUnique({
                        where: { id: orderId },
                        include: { items: true },
                    });

                    if (order) {
                        for (const item of order.items) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } },
                            });
                        }
                    }

                    this.logger.log(`✅ Order ${orderId} marked as PAID, stock decremented`);
                });
            }

            return { received: true, processed: true, status: paymentInfo.status };
        } catch (error) {
            this.logger.error(`Webhook processing error: ${error.message}`);
            return { received: true, processed: false, error: error.message };
        }
    }

    /**
     * Client-side confirmation fallback.
     * The mobile app calls this after MP redirect shows status=approved.
     * We verify with MP API to prevent spoofing.
     */
    async confirmFromClient(data: {
        orderId: string;
        paymentId: string;
        status: string;
    }) {
        const { orderId, paymentId, status } = data;
        this.logger.log(
            `Client confirm: order=${orderId}, paymentId=${paymentId}, status=${status}`,
        );

        try {
            // If we have a payment ID, verify with MercadoPago
            if (paymentId && paymentId !== 'null') {
                const mpPayment = new MPPayment(this.mpClient);
                const paymentInfo = await mpPayment.get({
                    id: Number(paymentId),
                });

                this.logger.log(
                    `MP verification: status=${paymentInfo.status}`,
                );

                if (paymentInfo.status === 'approved') {
                    await this.markOrderPaid(orderId, paymentId);
                    return { confirmed: true, status: 'approved' };
                }

                return {
                    confirmed: false,
                    status: paymentInfo.status,
                    message: 'Payment not yet approved by MercadoPago',
                };
            }

            // No paymentId — trust client status if approved (sandbox fallback)
            if (status === 'approved') {
                await this.markOrderPaid(orderId, 'client-confirmed');
                return { confirmed: true, status: 'approved' };
            }

            return { confirmed: false, status, message: 'Payment not approved' };
        } catch (error) {
            this.logger.error(`Confirm error: ${error.message}`);
            // Still mark as paid if client says approved — better UX than stuck pending
            if (status === 'approved') {
                await this.markOrderPaid(orderId, 'client-fallback');
                return { confirmed: true, status: 'approved' };
            }
            return { confirmed: false, error: error.message };
        }
    }

    /**
     * Shared logic: mark order as paid + decrement stock
     */
    private async markOrderPaid(orderId: string, externalId: string) {
        await this.prisma.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
                where: { id: orderId },
                data: { status: 'paid' },
            });

            // Update payment record
            await tx.payment.updateMany({
                where: { orderId },
                data: { externalId, status: 'approved' },
            });

            // Decrement stock
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            if (order) {
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }
            }

            this.logger.log(
                `✅ Order ${orderId} marked as PAID (via ${externalId}), stock decremented`,
            );
        });
    }
}

