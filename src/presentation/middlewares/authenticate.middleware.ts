import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import { tokenService, type TokenPayload } from "@/infra/services/token.service.js";
import type { FastifyReply, FastifyRequest } from "fastify";

declare module 'fastify' {
    interface FastifyRequest {
        user: TokenPayload
    }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>{
    const authHeader = request.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new UnauthorizedError('Missing authorization token');
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        throw new UnauthorizedError('Missing authorization token');
    }

    const payload = tokenService.verifyAccessToken(token);

    request.user = payload;
}