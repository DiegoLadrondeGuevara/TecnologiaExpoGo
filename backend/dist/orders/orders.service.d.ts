import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class OrdersService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    create(userId: string, data: {
        items: {
            productId: string;
            quantity: number;
        }[];
        currency: string;
        exchangeRate: number;
        shippingAddress?: string;
    }): Promise<{
        items: ({
            product: {
                id: string;
                empresaId: string;
                updatedAt: Date;
                createdAt: Date;
                nameEs: string;
                nameEn: string;
                descriptionEn: string;
                descriptionEs: string;
                price: number;
                specs: import("@prisma/client/runtime/library").JsonValue;
                imageUrl: string;
                stock: number;
                categoryId: string;
            };
        } & {
            id: string;
            orderId: string;
            quantity: number;
            unitPrice: number;
            productId: string;
        })[];
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        currency: string;
        status: string;
        userId: string;
        subtotal: number;
        tax: number;
        total: number;
        exchangeRate: number;
        shippingAddress: string | null;
    }>;
    cancelOrder(orderId: string, userId: string): Promise<{
        cancelled: boolean;
        orderId: string;
    }>;
    findAll(userId: string, role: string): Promise<({
        user: {
            email: string;
            name: string;
        };
        payment: {
            id: string;
            orderId: string;
            externalId: string | null;
            amount: number;
            currency: string;
            status: string;
            method: string;
            mpPreferenceId: string | null;
            mpInitPoint: string | null;
            date: Date;
        } | null;
        items: ({
            product: {
                id: string;
                empresaId: string;
                updatedAt: Date;
                createdAt: Date;
                nameEs: string;
                nameEn: string;
                descriptionEn: string;
                descriptionEs: string;
                price: number;
                specs: import("@prisma/client/runtime/library").JsonValue;
                imageUrl: string;
                stock: number;
                categoryId: string;
            };
        } & {
            id: string;
            orderId: string;
            quantity: number;
            unitPrice: number;
            productId: string;
        })[];
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        currency: string;
        status: string;
        userId: string;
        subtotal: number;
        tax: number;
        total: number;
        exchangeRate: number;
        shippingAddress: string | null;
    })[]>;
    updateStatus(orderId: string, newStatus: string): Promise<{
        user: {
            email: string;
            name: string;
        };
        payment: {
            id: string;
            orderId: string;
            externalId: string | null;
            amount: number;
            currency: string;
            status: string;
            method: string;
            mpPreferenceId: string | null;
            mpInitPoint: string | null;
            date: Date;
        } | null;
        items: ({
            product: {
                id: string;
                empresaId: string;
                updatedAt: Date;
                createdAt: Date;
                nameEs: string;
                nameEn: string;
                descriptionEn: string;
                descriptionEs: string;
                price: number;
                specs: import("@prisma/client/runtime/library").JsonValue;
                imageUrl: string;
                stock: number;
                categoryId: string;
            };
        } & {
            id: string;
            orderId: string;
            quantity: number;
            unitPrice: number;
            productId: string;
        })[];
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        currency: string;
        status: string;
        userId: string;
        subtotal: number;
        tax: number;
        total: number;
        exchangeRate: number;
        shippingAddress: string | null;
    }>;
}
