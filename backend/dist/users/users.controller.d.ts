import { UsersService } from './users.service';
export declare class UpdateProfileDto {
    name?: string;
    address?: string;
    preferredLanguage?: string;
    preferredCurrency?: string;
}
export declare class SavePushTokenDto {
    token: string;
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
        address: string | null;
        registeredAt: Date;
    } | null>;
    updateProfile(req: {
        user: {
            id: string;
        };
    }, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        preferredLanguage: string;
        preferredCurrency: string;
        address: string | null;
    }>;
    savePushToken(req: {
        user: {
            id: string;
        };
    }, dto: SavePushTokenDto): Promise<{
        saved: boolean;
    }>;
}
