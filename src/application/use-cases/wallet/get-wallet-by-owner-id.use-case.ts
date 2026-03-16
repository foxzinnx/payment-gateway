import type { WalletOutputDTO } from "@/application/dtos/wallet.dto.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { IWalletRepository } from "@/domain/repositories/wallet.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetWalletByOwnerIdUseCase{
    constructor(private readonly walletRepository: IWalletRepository){}

    async execute(ownerId: string): Promise<WalletOutputDTO>{
        const wallet = await this.walletRepository.findByOwnerId(
            new UniqueEntityId(ownerId)
        )
        
        if(!wallet){
            throw new NotFoundError('Wallet')
        }

        return this.toOutput(wallet);
    }

    private toOutput(wallet: Wallet): WalletOutputDTO{
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