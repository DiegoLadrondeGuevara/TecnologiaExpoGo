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
            throw new NotFoundException('Configuration not found');
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
