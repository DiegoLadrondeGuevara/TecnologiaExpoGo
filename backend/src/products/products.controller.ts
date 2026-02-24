import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    Min,
} from 'class-validator';

export class CreateProductDto {
    @IsString() @IsNotEmpty() nameEn!: string;
    @IsString() @IsNotEmpty() nameEs!: string;
    @IsString() @IsNotEmpty() descriptionEn!: string;
    @IsString() @IsNotEmpty() descriptionEs!: string;
    @IsNumber() @Min(0) price!: number;
    @IsArray() specs!: string[];
    @IsString() @IsNotEmpty() imageUrl!: string;
    @IsNumber() @Min(0) stock!: number;
    @IsString() @IsNotEmpty() categoryId!: string;
}

export class UpdateProductDto {
    @IsOptional() @IsString() nameEn?: string;
    @IsOptional() @IsString() nameEs?: string;
    @IsOptional() @IsString() descriptionEn?: string;
    @IsOptional() @IsString() descriptionEs?: string;
    @IsOptional() @IsNumber() @Min(0) price?: number;
    @IsOptional() @IsArray() specs?: string[];
    @IsOptional() @IsString() imageUrl?: string;
    @IsOptional() @IsNumber() @Min(0) stock?: number;
    @IsOptional() @IsString() categoryId?: string;
}

@Controller('products')
export class ProductsController {
    constructor(
        private productsService: ProductsService,
        private prisma: PrismaService,
    ) { }

    private async getDefaultEmpresaId(): Promise<string> {
        const empresa = await this.prisma.empresa.findFirst();
        return empresa?.id ?? '';
    }

    @Get()
    async findAll(
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
    ) {
        const empresaId = await this.getDefaultEmpresaId();
        return this.productsService.findAll(empresaId, search, categoryId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(
        @Request() req: { user: { empresaId: string } },
        @Body() dto: CreateProductDto,
    ) {
        return this.productsService.create(req.user.empresaId, dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.productsService.remove(id);
    }
}
