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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats(empresaId) {
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map