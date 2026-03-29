import { UnauthorizedError } from '@/domain/errors/unauthorized.error.js';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

export type TokenPayload = {
    sub: string;
    type: 'CUSTOMER' | 'MERCHANT'
};

export class TokenService {
    private readonly accessSecret: string;
    private readonly refreshSecret: string;
    private readonly accessExpiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor(){
        this.accessSecret = process.env.JWT_ACCESS_SECRET!
        this.refreshSecret = process.env.JWT_REFRESH_SECRET!
        this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15min'
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
    }

    generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(
        { ...payload, jti: randomUUID() }, // ← jti garante unicidade
        this.accessSecret,
        { expiresIn: this.accessExpiresIn } as jwt.SignOptions
        )
    }

    generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(
        { ...payload, jti: randomUUID() }, // ← jti garante unicidade
        this.refreshSecret,
        { expiresIn: this.refreshExpiresIn } as jwt.SignOptions
        )
    }

    verifyAccessToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.accessSecret) as TokenPayload;
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.refreshSecret) as TokenPayload;
        } catch (error) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
    }
}

export const tokenService = new TokenService();