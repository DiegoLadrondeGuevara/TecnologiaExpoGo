import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(empresaId: string): Promise<{
        totalSales: number;
        totalOrders: number;
        activeUsers: number;
        totalProducts: number;
        recentPayments: {
            id: string;
            orderId: string;
            userName: string;
            amount: number;
            currency: string;
            status: string;
            date: Date;
            items: string[];
        }[];
    }>;
}
