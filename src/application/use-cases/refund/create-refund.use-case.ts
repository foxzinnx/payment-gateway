import type { CreateRefundInputDTO, RefundOutputDTO } from "@/application/dtos/refund.dto.js";
import { Refund } from "@/domain/entities/refund.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { TransactionAlreadyRefundedError } from "@/domain/errors/transaction-already-refunded.error.js";
import { TransactionNotRefundableError } from "@/domain/errors/transaction-not-refundable.error.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import type { RefundRepository } from "@/domain/repositories/refund.repository.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { RefundUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import type { WebhookRepository } from "@/domain/repositories/webhook.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import type { WebhookPublisherService } from "@/infra/services/webhook.publisher.service.js";

export class CreateRefundUseCase {
    constructor(
        private readonly refundRepository: RefundRepository,
        private readonly transactionRepository: TransactionRepository,
        private readonly walletRepository: WalletRepository,
        private readonly refundUnitOfWork: RefundUnitOfWork,
        private readonly webhookPublisher: WebhookPublisherService
    ){}

    async execute(merchantId: string, transactionId: string, input: CreateRefundInputDTO): Promise<RefundOutputDTO>{
        const transactionIdVO = new UniqueEntityId(transactionId)
        const transaction = await this.transactionRepository.findById(transactionIdVO);
        if(!transaction) throw new NotFoundError('Transaction');

        if(transaction.merchantId.value !== merchantId){
            throw new UnauthorizedError('You can only refund transactions you received')
        }

        if(transaction.isRefunded){
            throw new TransactionAlreadyRefundedError()
        }

        if(!transaction.isApproved){
            throw new TransactionNotRefundableError();
        }

        const existingRefund = await this.refundRepository.findByTransactionId(transactionIdVO);
        if(existingRefund) throw new TransactionAlreadyRefundedError();

        const merchantWallet = await this.walletRepository.findByOwnerId(transaction.merchantId);
        if(!merchantWallet) throw new NotFoundError('Merchant wallet');

        const customerWallet = await this.walletRepository.findByOwnerId(transaction.customerId);
        if(!customerWallet) throw new NotFoundError('Customer wallet');

        const refund = Refund.create({
            transactionId: new UniqueEntityId(transactionId),
            merchantId: new UniqueEntityId(merchantId),
            customerId: transaction.customerId,
            amountInCents: transaction.amount.amountInCents,
            currency: transaction.currency,
            reason: input.reason
        });

        merchantWallet.debit(transaction.amount);
        customerWallet.credit(transaction.amount);
        transaction.refund();
        refund.complete();

        await this.refundUnitOfWork.execute({
            refund,
            transaction,
            merchantWallet,
            customerWallet
        });

        this.webhookPublisher.publish(
            merchantId,
            WEBHOOK_EVENTS.TRANSACTION_REFUNDED,
            refund.toOutputDTO()
        ).catch(() => {})

        return refund.toOutputDTO();
    }
}