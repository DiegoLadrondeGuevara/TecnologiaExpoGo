import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getProductReviews(productId: string): Promise<{
        reviews: ({
            user: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            userId: string;
            productId: string;
            stars: number;
            comment: string | null;
        })[];
        averageRating: number;
        totalReviews: number;
    }>;
    createReview(userId: string, data: {
        productId: string;
        stars: number;
        comment?: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        createdAt: Date;
        userId: string;
        productId: string;
        stars: number;
        comment: string | null;
    }>;
}
