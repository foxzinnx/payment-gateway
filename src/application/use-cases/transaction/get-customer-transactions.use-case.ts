import type { ITransactionRepository } from '@/domain/repositories/transaction.repository.js'
import { Transaction } from '@/domain/entities/transaction.entity.js'
import type { TransactionOutputDTO } from '@/application/dtos/transaction.dto.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'

export class GetCustomerTransactionsUseCase {
  constructor(
    private readonly transactionRepository: ITransactionRepository
  ) {}

  async execute(customerId: string): Promise<TransactionOutputDTO[]> {
    const transactions =
      await this.transactionRepository.findAllByCustomerId(
        new UniqueEntityId(customerId)
      )

    return transactions.map(this.toOutput)
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