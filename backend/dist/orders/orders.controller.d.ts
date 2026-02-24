import { OrdersService } from './orders.service';
declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    currency: string;
    exchangeRate: number;
}
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    create(req: {
        user: {
            id: string;
        };
    }, dto: CreateOrderDto): Promise<{
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
    }>;
    findAll(req: {
        user: {
            id: string;
            role: string;
        };
    }): Promise<({
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
    })[]>;
}
export {};
