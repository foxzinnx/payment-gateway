import { CreateApiKeyUseCase } from "@/application/use-cases/api-key/create-api-key.use-case.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { InMemoryApiKeyRepository } from "@/tests/repositories/in-memory-api-key.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('CreateApiKeyUseCase', () => {
    let repository: InMemoryApiKeyRepository;
    let sut: CreateApiKeyUseCase;

    beforeEach(() => {
        repository = new InMemoryApiKeyRepository();
        sut = new CreateApiKeyUseCase(repository);
    });

    describe('successful creation', () => {
        it('should create an api key and return the rawKey', async () => {
            const output = await sut.execute({ name: 'CapyFood Production' });

            expect(output.id).toBeDefined();
            expect(output.name).toBe('CapyFood Production');
            expect(output.rawKey).toBeDefined();
            expect(output.rawKey).toMatch(/^payflow_live_/);
            expect(output.keyPrefix).toBeDefined();
            expect(output.createdAt).toBeInstanceOf(Date);
        });

        it('should save the hash not the raw key in repository', async () => {
            const output = await sut.execute({ name: 'CapyFood Production' });

            const savedKey = repository.items[0];

            expect(savedKey?.keyHash).not.toBe(output.rawKey);
            expect(savedKey?.keyHash).toHaveLength(64);
        });

        it('should generate unique raw keys for each api key', async () => {
            const first = await sut.execute({ name: 'CapyFood Production' });
            const second = await sut.execute({ name: 'CapyFood Other' });

            expect(first.rawKey).not.toBe(second.rawKey);
        });

        it('should generate unique hashes for each api key', async () => {
            await sut.execute({ name: 'CapyFood Production' });
            await sut.execute({ name: 'CapyFood Other' });

            expect(repository.items[0]?.keyHash).not.toBe(repository.items[1]?.keyHash);
        });

        it('should save api key as active by default', async () => {
            await sut.execute({ name: 'CapyFood Production' });

            expect(repository.items[0]?.isActive).toBe(true);
        });

        it('should save with null lastUsedAt', async () => {
            await sut.execute({ name: 'CapyFood Production' });

            expect(repository.items[0]?.lastUsedAt).toBeNull();
        });
    });

    describe('validation errors', () => {
        it('should throw for name shorter than 3 chars', async () => {
            await expect(
                sut.execute({ name: 'AB' })
            ).rejects.toThrowError(InvalidArgumentError)
        });
    });
})