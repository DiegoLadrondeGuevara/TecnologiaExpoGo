"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
const google_auth_library_1 = require("google-auth-library");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    googleClient;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
        this.googleClient = new google_auth_library_1.OAuth2Client(googleClientId);
        if (googleClientId) {
            this.logger.log('✅ Google OAuth configured');
        }
        else {
            this.logger.warn('GOOGLE_CLIENT_ID not set — Google login will not work');
        }
    }
    async register(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        let empresa = await this.prisma.empresa.findFirst();
        if (!empresa) {
            empresa = await this.prisma.empresa.create({
                data: { name: 'TechStore' },
            });
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
    async login(identifier, password) {
        let user;
        if (identifier.includes('@')) {
            user = await this.prisma.user.findUnique({ where: { email: identifier } });
        }
        else {
            user = await this.prisma.user.findUnique({ where: { username: identifier } });
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException('This account uses Google login. Please sign in with Google.');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async loginWithGoogle(idToken) {
        const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
        const ticket = await this.googleClient.verifyIdToken({
            idToken,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        const { sub: googleId, email, name, picture } = payload;
        let user = await this.prisma.user.findUnique({
            where: { googleId: googleId },
        });
        if (!user) {
            user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (user) {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleId,
                        avatarUrl: user.avatarUrl || picture,
                    },
                });
                this.logger.log(`🔗 Linked Google account to existing user: ${email}`);
            }
            else {
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
                        googleId: googleId,
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
    generateToken(user) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map