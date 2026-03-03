import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(empresaId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: string;
        preferredLanguage: string;
        preferredCurrency: string;
        registeredAt: Date;
        orders: number;
        totalSpent: number;
    }[]>;
    findMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        preferredLanguage: string;
        preferredCurrency: string;
        address: string | null;
        registeredAt: Date;
    } | null>;
    updateProfile(userId: string, data: {
        name?: string;
        address?: string;
        preferredLanguage?: string;
        preferredCurrency?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        preferredLanguage: string;
        preferredCurrency: string;
        address: string | null;
    }>;
    savePushToken(userId: string, token: string): Promise<{
        saved: boolean;
    }>;
}
