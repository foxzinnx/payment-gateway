import type { TransactionRepository } from '@/domain/repositories/transaction.repository.js'
import { Transaction } from '@/domain/entities/transaction.entity.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'

export class InMemoryTransactionRepository implements TransactionRepository {
  public items: Transaction[] = []

  async findById(id: UniqueEntityId): Promise<Transaction | null> {
    return this.items.find((t) => t.id.equals(id)) ?? null
  }

  async findByIdempotencyKey(key: string): Promise<Transaction | null> {
    return this.items.find((t) => t.idempotencyKey === key) ?? null
  }

  findAllByCustomerId(customerId: UniqueEntityId): Promise<Transaction[]> {
    throw new Error('Method not implemented.')
  }

  async save(transaction: Transaction): Promise<void> {
    this.items.push(transaction)
  }

  async update(transaction: Transaction): Promise<void> {
    const index = this.items.findIndex((t) => t.id.equals(transaction.id))
    if (index >= 0) this.items[index] = transaction
  }
}