import type { ApiKeyOutputDTO } from "@/application/dtos/api-key.dto.js";
import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

interface ApiKeyProps {
    name: string;
    keyHash: string;
    keyPrefix: string;
    isActive: boolean;
    lastUsedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export class ApiKey extends Entity<ApiKeyProps>{
    private constructor(props: ApiKeyProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<ApiKeyProps, 'createdAt' | 'updatedAt' | 'lastUsedAt' | 'isActive'>, id?: UniqueEntityId): ApiKey {
        ApiKey.validateName(props.name);

        const now = new Date();

        return new ApiKey(
            {
                name: props.name.trim(),
                keyHash: props.keyHash,
                keyPrefix: props.keyPrefix,
                isActive: true,
                lastUsedAt: null,
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    static reconstitute(props: ApiKeyProps, id: UniqueEntityId): ApiKey {
        return new ApiKey(props ,id);
    }

    get name(): string { return this._props.name }
    get keyHash(): string { return this._props.keyHash }
    get keyPrefix(): string { return this._props.keyPrefix }
    get isActive(): boolean { return this._props.isActive }
    get lastUsedAt(): Date | null { return this._props.lastUsedAt }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    deactivate(): void {
        this._props.isActive = false;
        this._props.updatedAt = new Date();
    }

    recordUsage(): void {
        this._props.lastUsedAt = new Date();
        this._props.updatedAt = new Date();
    }

    private static validateName(name: string): void {
        if(!name || name.trim().length < 3){
            throw new InvalidArgumentError('API Key name must have at least 3 characters')
        }
    }

    toOutputDTO(): ApiKeyOutputDTO {
        return {
            id: this.id.value,
            name: this._props.name,
            keyPrefix: this._props.keyPrefix,
            isActive: this._props.isActive,
            lastUsedAt: this._props.lastUsedAt,
            createdAt: this._props.createdAt
        }
    }
}