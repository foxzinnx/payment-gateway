import type { ApiKey } from "@/domain/entities/api-key.entity.js";
import type { ApiKeyRepository } from "@/domain/repositories/api-key.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class InMemoryApiKeyRepository implements ApiKeyRepository{
    public items: ApiKey[] = [];
    
    async findById(id: UniqueEntityId): Promise<ApiKey | null> {
        return this.items.find((k) => k.id.equals(id)) ?? null;
    }

    async findByHash(hash: string): Promise<ApiKey | null> {
        return this.items.find((k) => k.keyHash === hash) ?? null;
    }
    
    async findAll(): Promise<ApiKey[]> {
        return [...this.items];
    }

    async save(apiKey: ApiKey): Promise<void> {
        this.items.push(apiKey);
    }

    async update(apiKey: ApiKey): Promise<void> {
        const index = this.items.findIndex((k) => k.id.equals(apiKey.id));
        if(index >= 0) this.items[index] = apiKey;
    }

}