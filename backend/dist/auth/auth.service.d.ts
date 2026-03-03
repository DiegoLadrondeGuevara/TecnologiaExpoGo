import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly logger;
    private googleClient;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        access_token: string;
    }>;
    login(identifier: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatarUrl: string | null;
        };
        access_token: string;
    }>;
    loginWithGoogle(idToken: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            avatarUrl: string | null;
        };
        access_token: string;
    }>;
    private generateToken;
}
