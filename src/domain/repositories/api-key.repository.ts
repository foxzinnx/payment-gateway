import type { ApiKey } from "../entities/api-key.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface ApiKeyRepository {
    findById(id: UniqueEntityId): Promise<ApiKey | null>;
    findByHash(hash: string): Promise<ApiKey | null>;
    findAll(): Promise<ApiKey[]>;
    save(apiKey: ApiKey): Promise<void>;
    update(apiKey: ApiKey): Promise<void>;
}