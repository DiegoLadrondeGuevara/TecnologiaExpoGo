import { PrismaService } from '../prisma/prisma.service';
export declare class StoreSettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSetting(key: string): Promise<string | null>;
    upsertSetting(key: string, value: string): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
    }>;
}
