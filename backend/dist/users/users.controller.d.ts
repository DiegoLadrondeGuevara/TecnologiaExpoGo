import { UsersService } from './users.service';
export declare class UpdatePreferencesDto {
    preferredLanguage?: string;
    preferredCurrency?: string;
}
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(req: {
        user: {
            empresaId: string;
        };
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: string;
        preferredLanguage: string;
        preferredCurrency: string;
        registeredAt: Date;
        orders: number;
        totalSpent: number;
    }[]>;
    findMe(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        preferredLanguage: string;
        preferredCurrency: string;
        registeredAt: Date;
    } | null>;
    updatePreferences(req: {
        user: {
            id: string;
        };
    }, dto: UpdatePreferencesDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        preferredLanguage: string;
        preferredCurrency: string;
    }>;
}
