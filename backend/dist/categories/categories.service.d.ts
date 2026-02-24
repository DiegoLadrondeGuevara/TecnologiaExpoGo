import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(empresaId: string): Promise<({
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
    create(empresaId: string, data: {
        name: string;
        color: string;
    }): Promise<{
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
