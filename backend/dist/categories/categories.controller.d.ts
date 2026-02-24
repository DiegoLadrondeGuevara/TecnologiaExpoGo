import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class CreateCategoryDto {
    name: string;
    color?: string;
}
export declare class CategoriesController {
    private categoriesService;
    private prisma;
    constructor(categoriesService: CategoriesService, prisma: PrismaService);
    private getDefaultEmpresaId;
    findAll(): Promise<({
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        empresaId: string;
        createdAt: Date;
        color: string;
    })[]>;
    create(req: {
        user: {
            empresaId: string;
        };
    }, dto: CreateCategoryDto): Promise<{
        _count: {
            products: number;
        };
    } & {
        id: string;
        name: string;
        empresaId: string;
        createdAt: Date;
        color: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
