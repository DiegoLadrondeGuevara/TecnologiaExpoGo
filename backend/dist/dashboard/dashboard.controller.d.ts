import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(req: {
        user: {
            empresaId: string;
        };
    }): Promise<{
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
