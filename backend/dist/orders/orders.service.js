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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let OrdersService = class OrdersService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async create(userId, data) {
        const products = await this.prisma.product.findMany({
            where: { id: { in: data.items.map((i) => i.productId) } },
        });
        let subtotal = 0;
        const orderItems = data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product)
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.nameEn}`);
            }
            const lineTotal = product.price * item.quantity;
            subtotal += lineTotal;
            return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            };
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { empresa: { include: { config: true } } },
        });
        const taxRate = user?.empresa?.config?.taxRate ?? 0.16;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
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
    async cancelOrder(orderId, userId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.userId !== userId) {
            throw new common_1.ForbiddenException('You can only cancel your own orders');
        }
        if (order.status !== 'pending') {
            throw new common_1.BadRequestException('Only pending orders can be cancelled');
        }
        await this.prisma.$transaction(async (tx) => {
            if (order.payment) {
                await tx.payment.delete({ where: { id: order.payment.id } });
            }
            await tx.orderItem.deleteMany({ where: { orderId } });
            await tx.order.delete({ where: { id: orderId } });
        });
        return { cancelled: true, orderId };
    }
    async findAll(userId, role) {
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
    async updateStatus(orderId, newStatus) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const updated = await this.prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: {
                items: { include: { product: true } },
                payment: true,
                user: { select: { name: true, email: true } },
            },
        });
        if (['shipped', 'delivered', 'cancelled'].includes(newStatus) && order.user.expoPushToken) {
            await this.notifications.sendOrderStatusPush(order.user.expoPushToken, orderId, newStatus);
        }
        return updated;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map