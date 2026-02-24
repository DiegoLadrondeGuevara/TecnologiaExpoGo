"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const mercadopago_1 = require("mercadopago");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    configService;
    logger = new common_1.Logger(PaymentsService_1.name);
    mpClient;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        const accessToken = this.configService.get('MP_ACCESS_TOKEN');
        if (!accessToken) {
            this.logger.warn('MP_ACCESS_TOKEN not configured — Mercado Pago will not work');
        }
        this.mpClient = new mercadopago_1.MercadoPagoConfig({
            accessToken: accessToken || '',
        });
        const webhookUrl = this.configService.get('MP_WEBHOOK_URL');
        this.logger.log(`✅ MercadoPago initialized | webhook: ${webhookUrl || '(not configured — set MP_WEBHOOK_URL in .env)'}`);
    }
    async createPreference(userId, data) {
        const order = await this.prisma.order.findUnique({
            where: { id: data.orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const items = order.items.map((item) => ({
            id: item.productId,
            title: item.product.nameEn,
            quantity: item.quantity,
            unit_price: Number((item.unitPrice * order.exchangeRate).toFixed(2)),
            currency_id: order.currency === 'PEN' ? 'PEN' : 'USD',
        }));
        const preference = new mercadopago_1.Preference(this.mpClient);
        const result = await preference.create({
            body: {
                items,
                back_urls: {
                    success: 'techstore://payment/success',
                    failure: 'techstore://payment/failure',
                    pending: 'techstore://payment/pending',
                },
                auto_return: 'approved',
                external_reference: data.orderId,
                notification_url: this.configService.get('MP_WEBHOOK_URL') || undefined,
            },
        });
        this.logger.log(`MP preference created: ${result.id} for order ${data.orderId}`);
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
    async handleWebhook(body) {
        this.logger.log(`Webhook received: ${JSON.stringify(body)}`);
        const isPaymentNotification = body.type === 'payment' ||
            body.action === 'payment.updated' ||
            body.action === 'payment.created';
        if (!isPaymentNotification || !body.data?.id) {
            return { received: true, processed: false };
        }
        try {
            const mpPayment = new mercadopago_1.Payment(this.mpClient);
            const paymentInfo = await mpPayment.get({ id: Number(body.data.id) });
            this.logger.log(`MP Payment ${body.data.id}: status=${paymentInfo.status}, ref=${paymentInfo.external_reference}`);
            const orderId = paymentInfo.external_reference;
            if (!orderId) {
                this.logger.warn('No external_reference in payment');
                return { received: true, processed: false };
            }
            const payment = await this.prisma.payment.findFirst({
                where: { orderId },
            });
            if (!payment) {
                this.logger.warn(`No payment record found for order ${orderId}`);
                return { received: true, processed: false };
            }
            await this.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    externalId: String(body.data.id),
                    status: paymentInfo.status || 'unknown',
                },
            });
            if (paymentInfo.status === 'approved') {
                await this.prisma.$transaction(async (tx) => {
                    await tx.order.update({
                        where: { id: orderId },
                        data: { status: 'paid' },
                    });
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
        }
        catch (error) {
            this.logger.error(`Webhook processing error: ${error.message}`);
            return { received: true, processed: false, error: error.message };
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map