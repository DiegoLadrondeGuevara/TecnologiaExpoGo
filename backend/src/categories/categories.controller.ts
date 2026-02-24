import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @IsString() @IsNotEmpty() name!: string;
    @IsOptional() @IsString() color?: string;
}

@Controller('categories')
export class CategoriesController {
    constructor(
        private categoriesService: CategoriesService,
        private prisma: PrismaService,
    ) { }

    private async getDefaultEmpresaId(): Promise<string> {
        const empresa = await this.prisma.empresa.findFirst();
        return empresa?.id ?? '';
    }

    @Get()
    async findAll() {
        const empresaId = await this.getDefaultEmpresaId();
        return this.categoriesService.findAll(empresaId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(
        @Request() req: { user: { empresaId: string } },
        @Body() dto: CreateCategoryDto,
    ) {
        return this.categoriesService.create(req.user.empresaId, {
            name: dto.name,
            color: dto.color || '#007AFF',
        });
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.categoriesService.remove(id);
    }
}
