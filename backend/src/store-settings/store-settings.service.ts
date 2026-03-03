import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StoreSettingsService {
    constructor(private prisma: PrismaService) { }

    async getSetting(key: string): Promise<string | null> {
        const setting = await this.prisma.storeSettings.findUnique({
            where: { key },
        });
        return setting?.value ?? null;
    }

    async upsertSetting(key: string, value: string) {
        return this.prisma.storeSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }
}
