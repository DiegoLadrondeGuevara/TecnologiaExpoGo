import { ConfigService as AppConfigService } from './config.service';
import { ConfigGateway } from './config.gateway';
export declare class UpdateConfigDto {
    defaultLanguage?: string;
    defaultCurrency?: string;
    exchangeRatePEN?: number;
    taxRate?: number;
    maintenanceMode?: boolean;
}
export declare class ConfigController {
    private configService;
    private configGateway;
    constructor(configService: AppConfigService, configGateway: ConfigGateway);
    getConfig(req: {
        user: {
            empresaId: string;
        };
    }): Promise<{
        id: string;
        empresaId: string;
        updatedAt: Date;
        defaultLanguage: string;
        defaultCurrency: string;
        baseCurrency: string;
        exchangeRatePEN: number;
        taxRate: number;
        maintenanceMode: boolean;
    }>;
    updateConfig(req: {
        user: {
            empresaId: string;
        };
    }, dto: UpdateConfigDto): Promise<{
        id: string;
        empresaId: string;
        updatedAt: Date;
        defaultLanguage: string;
        defaultCurrency: string;
        baseCurrency: string;
        exchangeRatePEN: number;
        taxRate: number;
        maintenanceMode: boolean;
    }>;
}
