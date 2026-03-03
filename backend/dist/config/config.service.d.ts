import { PrismaService } from '../prisma/prisma.service';
export declare class ConfigService {
    private prisma;
    constructor(prisma: PrismaService);
    getConfig(empresaId: string): Promise<{
        id: string;
        empresaId: string;
        updatedAt: Date;
        defaultLanguage: string;
        defaultCurrency: string;
        baseCurrency: string;
        exchangeRatePEN: number;
        taxRate: number;
        maintenanceMode: boolean;
    } | {
        defaultLanguage: string;
        defaultCurrency: string;
        exchangeRatePEN: number;
        taxRate: number;
        maintenanceMode: boolean;
    }>;
    updateConfig(empresaId: string, data: {
        defaultLanguage?: string;
        defaultCurrency?: string;
        exchangeRatePEN?: number;
        taxRate?: number;
        maintenanceMode?: boolean;
    }): Promise<{
        id: string;
        empresaId: string;
        updatedAt: Date;
        defaultLanguage: string;
        defaultCurrency: string;
        baseCurrency: string;
        exchangeRatePEN: number;
        taxRate: number;
        maintenanceMode: boolean;
    }>;
}
