import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
        access_token: string;
    }>;
    private generateToken;
}
