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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPreference(userId, data) {
        const order = await this.prisma.order.findUnique({
            where: { id: data.orderId },
            include: { items: { include: { product: true } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
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
    async handleWebhook(body) {
        if (body.action === 'payment.updated' || body.action === 'payment.created') {
            const payment = await this.prisma.payment.findFirst({
                where: { externalId: body.data.id },
            });
            if (payment) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'approved' },
                });
                await this.prisma.order.update({
                    where: { id: payment.orderId },
                    data: { status: 'paid' },
                });
            }
        }
        return { received: true };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map