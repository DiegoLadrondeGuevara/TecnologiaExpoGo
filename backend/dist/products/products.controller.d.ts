import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class CreateProductDto {
    nameEn: string;
    nameEs: string;
    descriptionEn: string;
    descriptionEs: string;
    price: number;
    specs: string[];
    imageUrl: string;
    stock: number;
    categoryId: string;
}
export declare class UpdateProductDto {
    nameEn?: string;
    nameEs?: string;
    descriptionEn?: string;
    descriptionEs?: string;
    price?: number;
    specs?: string[];
    imageUrl?: string;
    stock?: number;
    categoryId?: string;
}
export declare class ProductsController {
    private productsService;
    private prisma;
    constructor(productsService: ProductsService, prisma: PrismaService);
    private getDefaultEmpresaId;
    findAll(search?: string, categoryId?: string): Promise<({
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
        specs: import("@prisma/client/runtime/library").JsonValue;
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
        specs: import("@prisma/client/runtime/library").JsonValue;
        imageUrl: string;
        stock: number;
        categoryId: string;
    }>;
    create(req: {
        user: {
            empresaId: string;
        };
    }, dto: CreateProductDto): Promise<{
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
        specs: import("@prisma/client/runtime/library").JsonValue;
        imageUrl: string;
        stock: number;
        categoryId: string;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
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
        specs: import("@prisma/client/runtime/library").JsonValue;
        imageUrl: string;
        stock: number;
        categoryId: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
