import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private googleClient: OAuth2Client;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        this.googleClient = new OAuth2Client(googleClientId);
        if (googleClientId) {
            this.logger.log('✅ Google OAuth configured');
        } else {
            this.logger.warn('GOOGLE_CLIENT_ID not set — Google login will not work');
        }
    }

    async register(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
    }) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        // Get or create default empresa
        let empresa = await this.prisma.empresa.findFirst();
        if (!empresa) {
            empresa = await this.prisma.empresa.create({
                data: { name: 'TechStore' },
            });
            // Create default config for the empresa
            await this.prisma.appConfig.create({
                data: { empresaId: empresa.id },
            });
        }

        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role || 'CUSTOMER',
                empresaId: empresa.id,
            },
        });

        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            access_token: token,
        };
    }

    /**
     * Login with email OR username + password.
     * Auto-detects whether the identifier is an email (contains @) or username.
     */
    async login(identifier: string, password: string) {
        let user;

        if (identifier.includes('@')) {
            // Looks like an email
            user = await this.prisma.user.findUnique({ where: { email: identifier } });
        } else {
            // Treat as username
            user = await this.prisma.user.findUnique({ where: { username: identifier } });
        }

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // OAuth-only user trying to login with password
        if (!user.passwordHash) {
            throw new UnauthorizedException(
                'This account uses Google login. Please sign in with Google.',
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            access_token: token,
        };
    }

    /**
     * Login or Register using a Google ID token.
     * The mobile/web client sends the idToken obtained from Google Sign-In.
     */
    async loginWithGoogle(idToken: string) {
        const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: googleClientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new UnauthorizedException('Invalid Google token');
        }

        const { sub: googleId, email, name, picture } = payload;

        // 1. Try to find user by googleId
        let user = await this.prisma.user.findUnique({
            where: { googleId: googleId! },
        });

        if (!user) {
            // 2. Try to find by email (link existing account)
            user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (user) {
                // Link Google account to existing user
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleId!,
                        avatarUrl: user.avatarUrl || picture,
                    },
                });
                this.logger.log(`🔗 Linked Google account to existing user: ${email}`);
            } else {
                // 3. Create new user
                let empresa = await this.prisma.empresa.findFirst();
                if (!empresa) {
                    empresa = await this.prisma.empresa.create({
                        data: { name: 'TechStore' },
                    });
                    await this.prisma.appConfig.create({
                        data: { empresaId: empresa.id },
                    });
                }

                user = await this.prisma.user.create({
                    data: {
                        name: name || email.split('@')[0],
                        email,
                        googleId: googleId!,
                        avatarUrl: picture,
                        role: 'CUSTOMER',
                        empresaId: empresa.id,
                    },
                });
                this.logger.log(`✨ Created new user via Google: ${email}`);
            }
        }

        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            access_token: token,
        };
    }

    private generateToken(user: { id: string; email: string; role: string }) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload);
    }
}
