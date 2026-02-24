import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(empresaId: string, query?: string, categoryId?: string): Promise<({
        category: {
            id: string;
            name: string;
            empresaId: string;
            createdAt: Date;
            color: string;
        };
    } & {
        id: string;
        empresaId: string;
        updatedAt: Date;
        createdAt: Date;
        nameEs: string;
        nameEn: string;
        descriptionEn: string;
        descriptionEs: string;
        price: number;
        specs: Prisma.JsonValue;
        imageUrl: string;
        stock: number;
        categoryId: string;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            empresaId: string;
            createdAt: Date;
            color: string;
        };
    } & {
        id: string;
        empresaId: string;
        updatedAt: Date;
        createdAt: Date;
        nameEs: string;
        nameEn: string;
        descriptionEn: string;
        descriptionEs: string;
        price: number;
        specs: Prisma.JsonValue;
        imageUrl: string;
        stock: number;
        categoryId: string;
    }>;
    create(empresaId: string, data: {
        nameEn: string;
        nameEs: string;
        descriptionEn: string;
        descriptionEs: string;
        price: number;
        specs: string[];
        imageUrl: string;
        stock: number;
        categoryId: string;
    }): Promise<{
        category: {
            id: string;
            name: string;
            empresaId: string;
            createdAt: Date;
            color: string;
        };
    } & {
        id: string;
        empresaId: string;
        updatedAt: Date;
        createdAt: Date;
        nameEs: string;
        nameEn: string;
        descriptionEn: string;
        descriptionEs: string;
        price: number;
        specs: Prisma.JsonValue;
        imageUrl: string;
        stock: number;
        categoryId: string;
    }>;
    update(id: string, data: {
        nameEn?: string;
        nameEs?: string;
        descriptionEn?: string;
        descriptionEs?: string;
        price?: number;
        specs?: string[];
        imageUrl?: string;
        stock?: number;
        categoryId?: string;
    }): Promise<{
        category: {
            id: string;
            name: string;
            empresaId: string;
            createdAt: Date;
            color: string;
        };
    } & {
        id: string;
        empresaId: string;
        updatedAt: Date;
        createdAt: Date;
        nameEs: string;
        nameEn: string;
        descriptionEn: string;
        descriptionEs: string;
        price: number;
        specs: Prisma.JsonValue;
        imageUrl: string;
        stock: number;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
