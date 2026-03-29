import type { TransactionOutputDTO } from "@/application/dtos/transaction.dto.js";
import type { Transaction } from "@/domain/entities/transaction.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { ITransactionRepository } from "@/domain/repositories/transaction.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetTransactionByIdUseCase {
    constructor(private readonly transactionRepository: ITransactionRepository){}

    async execute(id: string): Promise<TransactionOutputDTO>{
        const transaction = await this.transactionRepository.findById(
            new UniqueEntityId(id)
        );

        if(!transaction){
            throw new NotFoundError('Transaction')
        }

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