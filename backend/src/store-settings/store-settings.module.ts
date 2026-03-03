import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StoreSettingsService } from './store-settings.service';
import { StoreSettingsController } from './store-settings.controller';

@Module({
    imports: [PrismaModule],
    controllers: [StoreSettingsController],
    providers: [StoreSettingsService],
    exports: [StoreSettingsService],
})
export class StoreSettingsModule { }
