import type { CreditWalletInputDTO, WalletOutputDTO } from "@/application/dtos/wallet.dto.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import { Money } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class CreditWalletUseCase{
    constructor(private readonly walletRepository: WalletRepository){}

    async execute(input: CreditWalletInputDTO): Promise<WalletOutputDTO>{
        const wallet = await this.walletRepository.findById(
            new UniqueEntityId(input.walletId)
        )

        if(!wallet){
            throw new NotFoundError('Wallet');
        }

        const amount = Money.create(input.amountInCents, wallet.currency);

        wallet.credit(amount);

        await this.walletRepository.update(wallet);

        return this.toOutput(wallet);
    }

    private toOutput(wallet: Wallet): WalletOutputDTO {
        return {
            id: wallet.id.value,
            ownerId: wallet.ownerId.value,
            ownerType: wallet.ownerType,
            balanceInCents: wallet.balance.amountInCents,
            balanceFormatted: wallet.balance.formatted,
            currency: wallet.currency,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt
        }
    }
}