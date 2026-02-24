import { AuthService } from './auth.service';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        access_token: string;
    }>;
}
