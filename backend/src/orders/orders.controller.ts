import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
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

    @IsOptional()
    @IsString()
    shippingAddress?: string;
}

export class UpdateOrderStatusDto {
    @IsString() @IsNotEmpty() status!: string;
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

    @Delete(':id/cancel')
    cancel(
        @Request() req: { user: { id: string } },
        @Param('id') id: string,
    ) {
        return this.ordersService.cancelOrder(id, req.user.id);
    }

    @Get()
    findAll(@Request() req: { user: { id: string; role: string } }) {
        return this.ordersService.findAll(req.user.id, req.user.role);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
    ) {
        return this.ordersService.updateStatus(id, dto.status);
    }
}
