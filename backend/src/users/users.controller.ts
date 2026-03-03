import {
    Controller,
    Get,
    Post,
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

export class UpdateProfileDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() address?: string;
    @IsOptional() @IsString() preferredLanguage?: string;
    @IsOptional() @IsString() preferredCurrency?: string;
}

export class SavePushTokenDto {
    @IsString() token!: string;
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
    updateProfile(
        @Request() req: { user: { id: string } },
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(req.user.id, dto);
    }

    @Post('me/push-token')
    savePushToken(
        @Request() req: { user: { id: string } },
        @Body() dto: SavePushTokenDto,
    ) {
        return this.usersService.savePushToken(req.user.id, dto.token);
    }
}
