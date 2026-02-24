import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(empresaId: string, query?: string, categoryId?: string) {
        const where: Prisma.ProductWhereInput = { empresaId };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (query) {
            where.OR = [
                { nameEn: { contains: query, mode: 'insensitive' } },
                { nameEs: { contains: query, mode: 'insensitive' } },
            ];
        }

        return this.prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    async create(
        empresaId: string,
        data: {
            nameEn: string;
            nameEs: string;
            descriptionEn: string;
            descriptionEs: string;
            price: number;
            specs: string[];
            imageUrl: string;
            stock: number;
            categoryId: string;
        },
    ) {
        return this.prisma.product.create({
            data: { ...data, empresaId },
            include: { category: true },
        });
    }

    async update(
        id: string,
        data: {
            nameEn?: string;
            nameEs?: string;
            descriptionEn?: string;
            descriptionEs?: string;
            price?: number;
            specs?: string[];
            imageUrl?: string;
            stock?: number;
            categoryId?: string;
        },
    ) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        return this.prisma.product.update({
            where: { id },
            data,
            include: { category: true },
        });
    }

    async remove(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        await this.prisma.product.delete({ where: { id } });
        return { success: true };
    }
}
