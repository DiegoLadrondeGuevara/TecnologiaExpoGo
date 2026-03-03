"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    prisma;
    logger = new common_1.Logger(ReviewsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProductReviews(productId) {
        const reviews = await this.prisma.review.findMany({
            where: { productId },
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
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
    async createReview(userId, data) {
        const existing = await this.prisma.review.findUnique({
            where: {
                userId_productId: { userId, productId: data.productId },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('You already reviewed this product');
        }
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
            throw new common_1.ForbiddenException('You can only review products you have purchased');
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
        this.logger.log(`⭐ Review created: ${review.stars} stars for product ${data.productId} by user ${userId}`);
        return review;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map