import type { TransactionOutputDTO } from "@/application/dtos/transaction.dto.js";
import { Transaction } from "@/domain/entities/transaction.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { PaymentUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import type { AuthorizationService } from "@/domain/services/authorization.service.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export interface PayWithLinkInputDTO {
    code: string;
    idempotencyKey?: string | undefined;
}

export class PayWithLinkUseCase {
    constructor(
        private readonly paymentLinkRepository: PaymentLinkRepository,
        private readonly customerRepository: CustomerRepository,
        private readonly merchantRepository: MerchantRepository,
        private readonly walletRepository: WalletRepository,
        private readonly transactionRepository: TransactionRepository,
        private readonly authorizationService: AuthorizationService,
        private readonly paymentUnitOfWork: PaymentUnitOfWork
    ){}

    async execute(customerId: string, input: PayWithLinkInputDTO): Promise<TransactionOutputDTO>{
        if(input.idempotencyKey){
            const existing = await this.transactionRepository.findByIdempotencyKey(input.idempotencyKey);
            if(existing) return existing.toOutputDTO();
        }
        const normalizedCode = input.code.toUpperCase().trim();
        const customerIdVO = new UniqueEntityId(customerId);

        const paymentLink = await this.paymentLinkRepository.findByCode(normalizedCode);
        if(!paymentLink) throw new NotFoundError('Payment link');

        paymentLink.validateForUse();

        const customer = await this.customerRepository.findById(customerIdVO);
        if(!customer) throw new NotFoundError('Customer');

        const merchant = await this.merchantRepository.findById(paymentLink.merchantId);
        if(!merchant) throw new NotFoundError('Merchant');

        const customerWallet = await this.walletRepository.findByOwnerId(customerIdVO);
        if(!customerWallet) throw new NotFoundError('Customer wallet');

        const merchantWallet = await this.walletRepository.findByOwnerId(paymentLink.merchantId);
        if(!merchantWallet) throw new NotFoundError('Merchant wallet');

        const transaction = Transaction.create({
            customerId: customerIdVO,
            merchantId: paymentLink.merchantId,
            amountInCents: paymentLink.amount.amountInCents,
            currency: paymentLink.currency,
            description: paymentLink.description ?? undefined,
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
            return transaction.toOutputDTO();
        }

        customerWallet.debit(transaction.amount);
        merchantWallet.credit(transaction.amount);
        transaction.approve();
        paymentLink.markAsUsed()

        await this.paymentUnitOfWork.execute({
            transaction,
            customerWallet,
            merchantWallet,
            paymentLink
        })

        return transaction.toOutputDTO();
    }
}