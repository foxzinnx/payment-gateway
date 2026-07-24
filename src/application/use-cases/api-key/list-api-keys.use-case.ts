import type { ApiKeyOutputDTO } from "@/application/dtos/api-key.dto.js";
import type { ApiKeyRepository } from "@/domain/repositories/api-key.repository.js";

export class ListApiKeysUseCase {
    constructor(private readonly apiKeyRepository: ApiKeyRepository){}

    async execute(): Promise<ApiKeyOutputDTO[]>{
        const apiKeys = await this.apiKeyRepository.findAll();
        return apiKeys.map((key) => key.toOutputDTO());
    }
}