import type { TransactionRepository } from '@/domain/repositories/transaction.repository.js'
import type { TransactionOutputDTO } from '@/application/dtos/transaction.dto.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'
import type { PaginatedOutput, PaginationInput } from '@/shared/types/pagination.js'

export class GetCustomerTransactionsUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(customerId: string, pagination: PaginationInput): Promise<PaginatedOutput<TransactionOutputDTO>> {
    const customerIdVO = new UniqueEntityId(customerId)

    const result = await this.transactionRepository.findAllByCustomerId(customerIdVO, pagination)

    return {
        data: result.data.map((t) => t.toOutputDTO()),
        meta: result.meta 
    }
  }
}