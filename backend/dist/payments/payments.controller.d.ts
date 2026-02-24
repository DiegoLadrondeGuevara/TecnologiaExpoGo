import { PaymentsService } from './payments.service';
export declare class CreatePreferenceDto {
    orderId: string;
}
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createPreference(req: {
        user: {
            id: string;
        };
    }, dto: CreatePreferenceDto): Promise<{
        id: string | undefined;
        init_point: string | undefined;
        sandbox_init_point: string | undefined;
        paymentId: string;
    }>;
    findAll(): Promise<({
        order: {
            user: {
                email: string;
                name: string;
            };
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
        };
    } & {
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
    })[]>;
    handleWebhook(body: {
        action: string;
        data: {
            id: string;
        };
    }): Promise<{
        received: boolean;
        processed: boolean;
        status?: undefined;
        error?: undefined;
    } | {
        received: boolean;
        processed: boolean;
        status: string | undefined;
        error?: undefined;
    } | {
        received: boolean;
        processed: boolean;
        error: any;
        status?: undefined;
    }>;
}
