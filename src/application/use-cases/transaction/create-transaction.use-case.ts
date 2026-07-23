import type { CreateTransactionInputDTO, TransactionOutputDTO } from "@/application/dtos/transaction.dto.js";
import { Transaction } from "@/domain/entities/transaction.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { PaymentUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import type { AuthorizationService } from "@/domain/services/authorization.service.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import type { WebhookPublisherService } from "@/infra/services/webhook.publisher.service.js";

export class CreateTransactionUseCase {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly merchantRepository: MerchantRepository,
        private readonly walletRepository: WalletRepository,
        private readonly paymentUnitOfWork: PaymentUnitOfWork,
        private readonly authorizationService: AuthorizationService,
        private readonly webhookPublisher: WebhookPublisherService
    ){}

    async execute(customerId: string, input: CreateTransactionInputDTO): Promise<TransactionOutputDTO> {
        if(input.idempotencyKey){
            const existing = await this.transactionRepository.findByIdempotencyKey(input.idempotencyKey);
            if(existing){
                return existing.toOutputDTO();
            }
        }

        const customer = await this.customerRepository.findById(
            new UniqueEntityId(customerId)
        );

        if(!customer) throw new NotFoundError('Customer');

        const merchant = await this.merchantRepository.findById(
            new UniqueEntityId(input.merchantId)
        );

        if(!merchant) throw new NotFoundError('Merchant');

        const customerWallet = await this.walletRepository.findByOwnerId(
            new UniqueEntityId(customerId)
        );

        if(!customerWallet) throw new NotFoundError('Customer wallet');

        const merchantWallet = await this.walletRepository.findByOwnerId(
            new UniqueEntityId(input.merchantId)
        );

        if(!merchantWallet) throw new NotFoundError('Merchant wallet');

        const transaction = Transaction.create({
            customerId: new UniqueEntityId(customerId),
            merchantId: new UniqueEntityId(input.merchantId),
            amountInCents: input.amountInCents,
            currency: input.currency,
            description: input.description,
            idempotencyKey: input.idempotencyKey
        });

        const authResult = this.authorizationService.authorize(
            transaction,
            customerWallet,
            merchant
        );

        if(!authResult.authorized){
            transaction.fail(authResult.reason);
            await this.transactionRepository.save(transaction);

            this.webhookPublisher.publish(
                transaction.merchantId.value,
                WEBHOOK_EVENTS.TRANSACTION_FAILED,
                transaction.toOutputDTO()
            ).catch(() => {})

            return transaction.toOutputDTO();
        }

        await this.paymentUnitOfWork.execute({ transaction, customerWallet, merchantWallet });

        this.webhookPublisher.publish(
            transaction.merchantId.value,
            WEBHOOK_EVENTS.TRANSACTION_APPROVED,
            transaction.toOutputDTO()
        ).catch(() => {})

        return transaction.toOutputDTO();
    }
}