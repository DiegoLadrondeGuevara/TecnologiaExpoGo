import {
    Controller,
    Get,
    Patch,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePreferencesDto {
    @IsOptional() @IsString() preferredLanguage?: string;
    @IsOptional() @IsString() preferredCurrency?: string;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    findAll(@Request() req: { user: { empresaId: string } }) {
        return this.usersService.findAll(req.user.empresaId);
    }

    @Get('me')
    findMe(@Request() req: { user: { id: string } }) {
        return this.usersService.findMe(req.user.id);
    }

    @Patch('me')
    updatePreferences(
        @Request() req: { user: { id: string } },
        @Body() dto: UpdatePreferencesDto,
    ) {
        return this.usersService.updatePreferences(req.user.id, dto);
    }
}
