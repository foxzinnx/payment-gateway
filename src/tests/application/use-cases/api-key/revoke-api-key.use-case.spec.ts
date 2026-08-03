import { CreateApiKeyUseCase } from "@/application/use-cases/api-key/create-api-key.use-case.js";
import { RevokeApiKeyUseCase } from "@/application/use-cases/api-key/revoke-api-key.use-case.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { InMemoryApiKeyRepository } from "@/tests/repositories/in-memory-api-key.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('RevokeApiKeyUseCase', () => {
    let repository: InMemoryApiKeyRepository;
    let sut: RevokeApiKeyUseCase;
    let createUseCase: CreateApiKeyUseCase;

    beforeEach(() => {
        repository = new InMemoryApiKeyRepository();
        sut = new RevokeApiKeyUseCase(repository);
        createUseCase = new CreateApiKeyUseCase(repository);
    });

    describe('successful revocation', () => {
        it('should revoke an active api key', async () => {
            const created = await createUseCase.execute({
                name: 'CapyFood Production'
            });

            const output = await sut.execute(created.id);

            expect(output.isActive).toBe(false);
            expect(repository.items[0]?.isActive).toBe(false);
        });

        it('should not delete the api key, only deactivate', async () => {
            const created = await createUseCase.execute({
                name: 'CapyFood Production'
            });

            await sut.execute(created.id);

            expect(repository.items).toHaveLength(1);
        });

        it('should not expose keyHash in output', async () => {
            const created = await createUseCase.execute({
                name: 'CapyFood Production'
            });

            const output = await sut.execute(created.id);

            expect(output).not.toHaveProperty('keyHash');
        });
    });

    describe('not found errors', () => {
        it('should throw NotFoundError when api key does not exist', async () => {
            await expect(
                sut.execute('00000000-0000-0000-0000-000000000000')
            ).rejects.toThrowError(NotFoundError)
        });
    });
});