import {
    Controller,
    Get,
    Put,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { StoreSettingsService } from './store-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsString } from 'class-validator';

export class UpdateSettingDto {
    @IsString() value: string;
}

@Controller('store-settings')
@UseGuards(JwtAuthGuard)
export class StoreSettingsController {
    constructor(private settingsService: StoreSettingsService) { }

    @Get(':key')
    async getSetting(@Param('key') key: string) {
        const value = await this.settingsService.getSetting(key);
        return { key, value };
    }

    @Put(':key')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    async updateSetting(
        @Param('key') key: string,
        @Body() dto: UpdateSettingDto,
    ) {
        const setting = await this.settingsService.upsertSetting(key, dto.value);
        return setting;
    }
}
