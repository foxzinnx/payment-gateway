import { CreateWalletUseCase } from "@/application/use-cases/wallet/create-wallet.use-case.js";
import { CreditWalletUseCase } from "@/application/use-cases/wallet/credit-wallet.use-case.js";
import { DebitWalletUseCase } from "@/application/use-cases/wallet/debit-wallet.use-case.js";
import { InsufficientFundsError } from "@/domain/errors/insufficient-funds.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryWalletRepository } from "@/tests/repositories/in-memory-wallet.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('DebitWalletUseCase', () => {
    let repository: InMemoryWalletRepository;
    let sut: DebitWalletUseCase;
    let creditWallet: CreditWalletUseCase;
    let createWallet: CreateWalletUseCase;

    beforeEach(() => {
        repository = new InMemoryWalletRepository();
        sut = new DebitWalletUseCase(repository);
        creditWallet = new CreditWalletUseCase(repository);
        createWallet = new CreateWalletUseCase(repository);
    });

    it('should debit wallet balance', async () => {
        const wallet = await createWallet.execute({
            ownerId: new UniqueEntityId().value,
            ownerType: 'CUSTOMER'
        });

        await creditWallet.execute({ walletId: wallet.id, amountInCents: 1000 });

        const output = await sut.execute({
            walletId: wallet.id,
            amountInCents: 500
        });

        expect(output.balanceInCents).toBe(500);
        expect(output.balanceFormatted).toBe('5.00');
    });

    it('should throw InsufficientFundsError when balance is too low', async () => {
        const wallet = await createWallet.execute({
            ownerId: new UniqueEntityId().value,
            ownerType: 'CUSTOMER'
        });

        await creditWallet.execute({ walletId: wallet.id, amountInCents: 1000 });

        await expect(
            sut.execute({ walletId: wallet.id, amountInCents: 2000 })
        ).rejects.toThrowError(InsufficientFundsError);
    })
})