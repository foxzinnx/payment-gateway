import type { CreateTransactionInputDTO, TransactionOutputDTO } from "@/application/dtos/transaction.dto.js";
import { Transaction } from "@/domain/entities/transaction.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { ICustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { IMerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { ITransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { IWalletRepository } from "@/domain/repositories/wallet.repository.js";
import type { IAuthorizationService } from "@/domain/services/authorization.service.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class CreateTransactionUseCase {
    constructor(
        private readonly transactionRepository: ITransactionRepository,
        private readonly customerRepository: ICustomerRepository,
        private readonly merchantRepository: IMerchantRepository,
        private readonly walletRepository: IWalletRepository,
        private readonly authorizationService: IAuthorizationService
    ){}

    async execute(customerId: string, input: CreateTransactionInputDTO): Promise<TransactionOutputDTO> {
        if(input.idempotencyKey){
            const existing = await this.transactionRepository.findByIdempotencyKey(input.idempotencyKey);
            if(existing){
                return this.toOutput(existing);
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

        const customerWallet = await this.walletRepository.findById(
            new UniqueEntityId(customerId)
        );

        if(!customerWallet) throw new NotFoundError('Customer wallet');

        const merchantWallet = await this.walletRepository.findById(
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
            return this.toOutput(transaction);
        }

        customerWallet.debit(transaction.amount);
        merchantWallet.credit(transaction.amount);
        transaction.approve();

        await this.transactionRepository.save(transaction);
        await this.walletRepository.update(customerWallet);
        await this.walletRepository.update(merchantWallet);

        return this.toOutput(transaction);
    }

    private toOutput(transaction: Transaction): TransactionOutputDTO {
        return {
            id: transaction.id.value,
            customerId: transaction.customerId.value,
            merchantId: transaction.merchantId.value,
            amountInCents: transaction.amount.amountInCents,
            amountFormatted: transaction.amount.formatted,
            currency: transaction.currency,
            status: transaction.status,
            description: transaction.description,
            denialReason: transaction.denialReason,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
        }
    }
}