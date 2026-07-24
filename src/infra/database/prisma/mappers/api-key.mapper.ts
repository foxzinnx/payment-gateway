import { ApiKey } from "@/domain/entities/api-key.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { ApiKey as PrismaApiKey } from "generated/prisma/client.js";

export class ApiKeyMapper{
    static toDomain(raw: PrismaApiKey): ApiKey {
        return ApiKey.reconstitute(
            {
                name: raw.name,
                keyHash: raw.keyHash,
                keyPrefix: raw.keyPrefix,
                isActive: raw.isActive,
                lastUsedAt: raw.lastUsedAt,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(apiKey: ApiKey){
        return {
            id: apiKey.id.value,
            name: apiKey.name,
            keyHash: apiKey.keyHash,
            keyPrefix: apiKey.keyPrefix,
            isActive: apiKey.isActive,
            lastUsedAt: apiKey.lastUsedAt ?? null,
            createdAt: apiKey.createdAt,
            updatedAt: apiKey.updatedAt
        }
    }
}