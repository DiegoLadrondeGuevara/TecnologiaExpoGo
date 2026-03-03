import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
    constructor(private prisma: PrismaService) { }

    async getConfig(empresaId: string) {
        const config = await this.prisma.appConfig.findUnique({
            where: { empresaId },
        });
        if (!config) {
            // Return sensible defaults if no config record exists
            return {
                defaultLanguage: 'en',
                defaultCurrency: 'USD',
                exchangeRatePEN: 3.80,
                taxRate: 0.16,
                maintenanceMode: false,
            };
        }
        return config;
    }

    async updateConfig(
        empresaId: string,
        data: {
            defaultLanguage?: string;
            defaultCurrency?: string;
            exchangeRatePEN?: number;
            taxRate?: number;
            maintenanceMode?: boolean;
        },
    ) {
        const config = await this.prisma.appConfig.update({
            where: { empresaId },
            data,
        });
        return config;
    }
}
