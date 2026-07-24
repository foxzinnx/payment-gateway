import type { CreateApiKeyInputDTO, CreateApiKeyOutputDTO } from "@/application/dtos/api-key.dto.js";
import { ApiKey } from "@/domain/entities/api-key.entity.js";
import type { ApiKeyRepository } from "@/domain/repositories/api-key.repository.js";
import { apiKeyService } from "@/infra/services/api-key.service.js";

export class CreateApiKeyUseCase{
    constructor(private readonly apiKeyRepository: ApiKeyRepository){}

    async execute(input: CreateApiKeyInputDTO): Promise<CreateApiKeyOutputDTO>{
        const { rawKey, keyHash, keyPrefix } = apiKeyService.generate();

        const apiKey = ApiKey.create({
            name: input.name,
            keyHash,
            keyPrefix
        });

        await this.apiKeyRepository.save(apiKey);

        return {
            id: apiKey.id.value,
            name: apiKey.name,
            rawKey,
            keyPrefix,
            createdAt: apiKey.createdAt
        }
    }
}