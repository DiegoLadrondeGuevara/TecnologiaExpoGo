import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePreferenceDto {
    @IsString() @IsNotEmpty() orderId!: string;
}

@Controller('payments')
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @Post('create-preference')
    @UseGuards(JwtAuthGuard)
    createPreference(
        @Request() req: { user: { id: string } },
        @Body() dto: CreatePreferenceDto,
    ) {
        return this.paymentsService.createPreference(req.user.id, dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAll() {
        return this.paymentsService.findAll();
    }

    @Post('webhook')
    handleWebhook(@Body() body: { action: string; data: { id: string } }) {
        return this.paymentsService.handleWebhook(body);
    }
}
