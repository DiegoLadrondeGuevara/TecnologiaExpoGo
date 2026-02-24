import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(empresaId: string) {
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

    async findMe(userId: string) {
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

    async updatePreferences(
        userId: string,
        data: { preferredLanguage?: string; preferredCurrency?: string },
    ) {
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
}
