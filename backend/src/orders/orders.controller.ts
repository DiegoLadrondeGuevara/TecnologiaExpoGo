import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
    @IsString() @IsNotEmpty() productId!: string;
    @IsNumber() @Min(1) quantity!: number;
}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];

    @IsString() @IsNotEmpty() currency!: string;
    @IsNumber() exchangeRate!: number;
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post()
    create(
        @Request() req: { user: { id: string } },
        @Body() dto: CreateOrderDto,
    ) {
        return this.ordersService.create(req.user.id, dto);
    }

    @Get()
    findAll(@Request() req: { user: { id: string; role: string } }) {
        return this.ordersService.findAll(req.user.id, req.user.role);
    }
}
