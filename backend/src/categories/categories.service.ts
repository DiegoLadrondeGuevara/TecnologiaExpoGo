import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async findAll(empresaId: string) {
        return this.prisma.category.findMany({
            where: { empresaId },
            include: { _count: { select: { products: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    async create(empresaId: string, data: { name: string; color: string }) {
        return this.prisma.category.create({
            data: { ...data, empresaId },
            include: { _count: { select: { products: true } } },
        });
    }

    async remove(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!category) throw new NotFoundException('Category not found');

        await this.prisma.category.delete({ where: { id } });
        return { success: true };
    }
}
