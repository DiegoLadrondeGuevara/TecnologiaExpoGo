import { ReviewsService } from './reviews.service';
export declare class CreateReviewDto {
    productId: string;
    stars: number;
    comment?: string;
}
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
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
    createReview(req: {
        user: {
            id: string;
        };
    }, dto: CreateReviewDto): Promise<{
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
