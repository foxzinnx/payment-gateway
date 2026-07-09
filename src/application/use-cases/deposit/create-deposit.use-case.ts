import type { CreateDepositInputDTO, DepositOutputDTO } from "@/application/dtos/deposit.dto.js";
import { Deposit } from "@/domain/entities/deposit.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { DepositRepository } from "@/domain/repositories/deposit.repository.js";
import type { DepositUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class CreditDepositUseCase {
    constructor(
        private readonly depositRepository: DepositRepository,
        private readonly walletRepository: WalletRepository,
        private readonly depositUnitOfWork: DepositUnitOfWork
    ){}

    async execute(customerId: UniqueEntityId, input: CreateDepositInputDTO): Promise<DepositOutputDTO>{
        const wallet = await this.walletRepository.findByOwnerId(customerId);
        if(!wallet) throw new NotFoundError('Wallet');

        const deposit = Deposit.create({
            customerId: customerId,
            walletId: wallet.id,
            amountInCents: input.amountInCents,
            currency: input.currency,
            method: input.method
        });

        deposit.complete();
        wallet.credit(deposit.amount);

        await this.depositUnitOfWork.execute({ deposit, wallet })

        return deposit.toOutputDTO()
    }
}