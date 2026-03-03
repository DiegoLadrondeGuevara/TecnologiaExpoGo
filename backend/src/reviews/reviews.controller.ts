import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsNotEmpty, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
    @IsString() @IsNotEmpty() productId!: string;
    @IsInt() @Min(1) @Max(5) stars!: number;
    @IsOptional() @IsString() comment?: string;
}

@Controller('reviews')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    @Get(':productId')
    getProductReviews(@Param('productId') productId: string) {
        return this.reviewsService.getProductReviews(productId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    createReview(
        @Request() req: { user: { id: string } },
        @Body() dto: CreateReviewDto,
    ) {
        return this.reviewsService.createReview(req.user.id, dto);
    }
}
