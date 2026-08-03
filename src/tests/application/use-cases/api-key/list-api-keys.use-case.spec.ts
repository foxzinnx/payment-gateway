import { CreateApiKeyUseCase } from "@/application/use-cases/api-key/create-api-key.use-case.js";
import { ListApiKeysUseCase } from "@/application/use-cases/api-key/list-api-keys.use-case.js";
import { RevokeApiKeyUseCase } from "@/application/use-cases/api-key/revoke-api-key.use-case.js";
import { InMemoryApiKeyRepository } from "@/tests/repositories/in-memory-api-key.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('ListApiKeysUseCase', () => {
    let repository: InMemoryApiKeyRepository;
    let sut: ListApiKeysUseCase;
    let createUseCase: CreateApiKeyUseCase;
    let revokeUseCase: RevokeApiKeyUseCase;

    beforeEach(() => {
        repository = new InMemoryApiKeyRepository();
        sut = new ListApiKeysUseCase(repository);
        createUseCase = new CreateApiKeyUseCase(repository);
        revokeUseCase = new RevokeApiKeyUseCase(repository);
    });

    it('should return empty list when no api keys exist', async () => {
        const output = await sut.execute();
        expect(output).toHaveLength(0);
    });

    it('should return all api keys', async () => {
        await createUseCase.execute({ name: 'CapyFood Production' });
        await createUseCase.execute({ name: 'Zé do Frango Production' });
        await createUseCase.execute({ name: 'G3x Production' });

        const output = await sut.execute();

        expect(output).toHaveLength(3);
    });

    it('should include revoked keys in the list', async () => {
        const created = await createUseCase.execute({
            name: 'CapyFood Production'
        });

        await revokeUseCase.execute(created.id);

        const output = await sut.execute();

        expect(output).toHaveLength(1);
        expect(output[0]?.isActive).toBe(false);
    });

    it('should never expose keyHash in output', async () => {
        await createUseCase.execute({ name: 'CapyFood Production' });

        const output = await sut.execute();

        expect(output[0]).not.toHaveProperty('keyHash');
    });

    it('should return correct key prefix', async () => {
        await createUseCase.execute({ name: 'CapyFood Production' });

        const output = await sut.execute();

        expect(output[0]?.keyPrefix).toContain('payflow_live_');
    });
})