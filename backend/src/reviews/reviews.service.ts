import { Injectable, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Get all reviews for a product (public)
     */
    async getProductReviews(productId: string) {
        const reviews = await this.prisma.review.findMany({
            where: { productId },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Also compute average
        const aggregate = await this.prisma.review.aggregate({
            where: { productId },
            _avg: { stars: true },
            _count: true,
        });

        return {
            reviews,
            averageRating: aggregate._avg.stars || 0,
            totalReviews: aggregate._count,
        };
    }

    /**
     * Create a review (user must have purchased the product)
     */
    async createReview(
        userId: string,
        data: { productId: string; stars: number; comment?: string },
    ) {
        // Check if user already reviewed this product
        const existing = await this.prisma.review.findUnique({
            where: {
                userId_productId: { userId, productId: data.productId },
            },
        });
        if (existing) {
            throw new ConflictException('You already reviewed this product');
        }

        // Check if user purchased this product
        const hasPurchased = await this.prisma.orderItem.findFirst({
            where: {
                productId: data.productId,
                order: {
                    userId,
                    status: 'paid',
                },
            },
        });

        if (!hasPurchased) {
            throw new ForbiddenException(
                'You can only review products you have purchased',
            );
        }

        const review = await this.prisma.review.create({
            data: {
                userId,
                productId: data.productId,
                stars: Math.min(5, Math.max(1, data.stars)),
                comment: data.comment || null,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });

        this.logger.log(
            `⭐ Review created: ${review.stars} stars for product ${data.productId} by user ${userId}`,
        );

        return review;
    }
}
