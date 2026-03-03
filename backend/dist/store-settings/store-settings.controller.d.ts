import { StoreSettingsService } from './store-settings.service';
export declare class UpdateSettingDto {
    value: string;
}
export declare class StoreSettingsController {
    private settingsService;
    constructor(settingsService: StoreSettingsService);
    getSetting(key: string): Promise<{
        key: string;
        value: string | null;
    }>;
    updateSetting(key: string, dto: UpdateSettingDto): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
    }>;
}
