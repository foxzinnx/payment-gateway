import type { ApiKey } from "@/domain/entities/api-key.entity.js";
import type { ApiKeyRepository } from "@/domain/repositories/api-key.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { ApiKeyMapper } from "../mappers/api-key.mapper.js";

export class PrismaApiKeyRepository implements ApiKeyRepository {
    async findById(id: UniqueEntityId): Promise<ApiKey | null> {
        const raw = await prisma.apiKey.findUnique({
            where: { id: id.value }
        });
        if(!raw) return null;

        return ApiKeyMapper.toDomain(raw);
    }

    async findByHash(hash: string): Promise<ApiKey | null> {
        const raw = await prisma.apiKey.findUnique({
            where: { keyHash: hash }
        });
        if(!raw) return null;

        return ApiKeyMapper.toDomain(raw);
    }

    async findAll(): Promise<ApiKey[]> {
        const raws = await prisma.apiKey.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return raws.map(ApiKeyMapper.toDomain)
    }

    async save(apiKey: ApiKey): Promise<void> {
        await prisma.apiKey.create({
            data: ApiKeyMapper.toPrisma(apiKey)
        });
    }

    async update(apiKey: ApiKey): Promise<void> {
        const data = ApiKeyMapper.toPrisma(apiKey);
        await prisma.apiKey.update({
            where: { id: data.id },
            data
        });
    }

}