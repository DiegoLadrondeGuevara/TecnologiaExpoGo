import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { ConfigGateway } from './config.gateway';

@Module({
    controllers: [ConfigController],
    providers: [ConfigService, ConfigGateway],
    exports: [ConfigService],
})
export class AppConfigModule { }
