import type { CreateDepositInputDTO, DepositOutputDTO } from "@/application/dtos/deposit.dto.js";
import { Deposit } from "@/domain/entities/deposit.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { DepositRepository } from "@/domain/repositories/deposit.repository.js";
import type { DepositUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import type { WebhookPublisherService } from "@/infra/services/webhook.publisher.service.js";

export class CreateDepositUseCase {
    constructor(
        private readonly depositRepository: DepositRepository,
        private readonly walletRepository: WalletRepository,
        private readonly depositUnitOfWork: DepositUnitOfWork,
        private readonly webhookPublisher: WebhookPublisherService
    ){}

    async execute(customerId: string, input: CreateDepositInputDTO): Promise<DepositOutputDTO>{
        const customerIdVO = new UniqueEntityId(customerId)
        const wallet = await this.walletRepository.findByOwnerId(customerIdVO);
        if(!wallet) throw new NotFoundError('Wallet');

        const deposit = Deposit.create({
            customerId: customerIdVO,
            walletId: wallet.id,
            amountInCents: input.amountInCents,
            currency: input.currency,
            method: input.method
        });

        deposit.complete();
        wallet.credit(deposit.amount);

        await this.depositUnitOfWork.execute({ deposit, wallet });

        this.webhookPublisher.publish(
            customerId,
            WEBHOOK_EVENTS.DEPOSIT_COMPLETED,
            deposit.toOutputDTO()
        ).catch(() => {})

        return deposit.toOutputDTO()
    }
}