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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(empresaId) {
        const users = await this.prisma.user.findMany({
            where: { empresaId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                preferredLanguage: true,
                preferredCurrency: true,
                registeredAt: true,
                _count: { select: { orders: true } },
                orders: {
                    where: { payment: { status: 'approved' } },
                    select: { total: true },
                },
            },
            orderBy: { registeredAt: 'desc' },
        });
        return users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            preferredLanguage: u.preferredLanguage,
            preferredCurrency: u.preferredCurrency,
            registeredAt: u.registeredAt,
            orders: u._count.orders,
            totalSpent: u.orders.reduce((sum, o) => sum + o.total, 0),
        }));
    }
    async findMe(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                preferredLanguage: true,
                preferredCurrency: true,
                registeredAt: true,
            },
        });
    }
    async updatePreferences(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                preferredLanguage: true,
                preferredCurrency: true,
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map