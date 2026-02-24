import {
    Controller,
    Get,
    Put,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ConfigService as AppConfigService } from './config.service';
import { ConfigGateway } from './config.gateway';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsBoolean,
} from 'class-validator';

export class UpdateConfigDto {
    @IsOptional()
    @IsString()
    defaultLanguage?: string;

    @IsOptional()
    @IsString()
    defaultCurrency?: string;

    @IsOptional()
    @IsNumber()
    exchangeRatePEN?: number;

    @IsOptional()
    @IsNumber()
    taxRate?: number;

    @IsOptional()
    @IsBoolean()
    maintenanceMode?: boolean;
}

@Controller('config')
export class ConfigController {
    constructor(
        private configService: AppConfigService,
        private configGateway: ConfigGateway,
    ) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    getConfig(@Request() req: { user: { empresaId: string } }) {
        return this.configService.getConfig(req.user.empresaId);
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async updateConfig(
        @Request() req: { user: { empresaId: string } },
        @Body() dto: UpdateConfigDto,
    ) {
        const updated = await this.configService.updateConfig(
            req.user.empresaId,
            dto,
        );
        // Push real-time update via WebSocket
        this.configGateway.emitConfigUpdate(updated as unknown as Record<string, unknown>);
        return updated;
    }
}
