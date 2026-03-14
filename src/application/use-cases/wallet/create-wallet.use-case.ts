import type { CreateWalletInputDTO, WalletOutputDTO } from "@/application/dtos/wallet.dto.js";
import { Wallet } from "@/domain/entities/wallet.entity.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import type { IWalletRepository } from "@/domain/repositories/wallet.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class CreateWalletUseCase{
    constructor(private readonly walletRepository: IWalletRepository){}

    async execute(input: CreateWalletInputDTO): Promise<WalletOutputDTO>{
        const ownerId = new UniqueEntityId(input.ownerId);

        const existing = await this.walletRepository.findByOwnerId(ownerId);
        if(existing){
            throw new InvalidArgumentError('This owner already has a wallet');
        }

        const wallet = Wallet.create(ownerId, input.ownerType, input.currency);

        await this.walletRepository.save(wallet);

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