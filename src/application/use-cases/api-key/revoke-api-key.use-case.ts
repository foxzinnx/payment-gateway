import type { ApiKeyOutputDTO } from "@/application/dtos/api-key.dto.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { ApiKeyRepository } from "@/domain/repositories/api-key.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class RevokeApiKeyUseCase{
    constructor(private readonly apiKeyRepository: ApiKeyRepository){}

    async execute(id: string): Promise<ApiKeyOutputDTO>{
        const apiKeyIdVO = new UniqueEntityId(id);
        const apiKey = await this.apiKeyRepository.findById(apiKeyIdVO);
        if(!apiKey) throw new NotFoundError('API Key');

        apiKey.deactivate();
        await this.apiKeyRepository.update(apiKey);

        return apiKey.toOutputDTO();
    }
}