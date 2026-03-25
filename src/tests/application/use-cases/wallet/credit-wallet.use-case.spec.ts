import { CreateWalletUseCase } from "@/application/use-cases/wallet/create-wallet.use-case.js";
import { CreditWalletUseCase } from "@/application/use-cases/wallet/credit-wallet.use-case.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryWalletRepository } from "@/tests/repositories/in-memory-wallet.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('CreditWalletUseCase', () => {
    let repository: InMemoryWalletRepository;
    let sut: CreditWalletUseCase;
    let createWallet: CreateWalletUseCase;

    beforeEach(() => {
        repository = new InMemoryWalletRepository();
        sut = new CreditWalletUseCase(repository);
        createWallet = new CreateWalletUseCase(repository);
    });

    it('should credit wallet balance', async () => {
        const wallet = await createWallet.execute({
            ownerId: new UniqueEntityId().value,
            ownerType: 'CUSTOMER'
        });

        const output = await sut.execute({
            walletId: wallet.id,
            amountInCents: 5000
        });

        expect(output.balanceInCents).toBe(5000);
        expect(output.balanceFormatted).toBe('50.00');
    });

    it('should throw NotFoundError for non-existent wallet', async () => {
        await expect(
            sut.execute({
                walletId: '00000000-0000-0000-0000-000000000000',
                amountInCents: 1000
            })
        ).rejects.toThrowError(NotFoundError);
    })
})