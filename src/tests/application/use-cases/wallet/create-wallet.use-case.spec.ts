import { CreateWalletUseCase } from "@/application/use-cases/wallet/create-wallet.use-case.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryWalletRepository } from "@/tests/repositories/in-memory-wallet.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('CreateWalletUseCase', () => {
    let repository: InMemoryWalletRepository;
    let sut: CreateWalletUseCase;

    beforeEach(() => {
        repository = new InMemoryWalletRepository();
        sut = new CreateWalletUseCase(repository);
    });

    it('should create a wallet with zero balance', async () => {
        const ownerId = new UniqueEntityId().value;

        const output = await sut.execute({
            ownerId,
            ownerType: 'CUSTOMER',
            currency: 'BRL'
        });

        expect(output.id).toBeDefined();
        expect(output.balanceInCents).toBe(0);
        expect(output.currency).toBe('BRL');
        expect(repository.items).toHaveLength(1);
    });

    it('should throw if owner already has a wallet', async () => {
        const ownerId = new UniqueEntityId().value;

        await sut.execute({ ownerId, ownerType: 'CUSTOMER'});

        await expect(
            sut.execute({ ownerId, ownerType: 'CUSTOMER' })
        ).rejects.toThrowError(InvalidArgumentError);
    })
})