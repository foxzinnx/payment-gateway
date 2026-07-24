import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import { apiKeyService } from "@/infra/services/api-key.service.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from '@/infra/database/prisma/prisma.client.js'

declare module 'Fastify'{
    interface FastifyRequest{
        apiKey?: {
            id: string;
            name: string;
        }
    }
}

export async function authenticateApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void>{
    const rawKey = request.headers['x-api-key'];

    if(!rawKey || typeof rawKey !== 'string'){
        throw new UnauthorizedError('Missing API key');
    }

    const keyHash = apiKeyService.hash(rawKey);

    const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash }
    });

    if(!apiKey || !apiKey.isActive){
        throw new UnauthorizedError('Invalid or revoked API key');
    }

    prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: new Date() },
    }).catch(() => {});

    request.apiKey = {
        id: apiKey.id,
        name: apiKey.name
    }
}