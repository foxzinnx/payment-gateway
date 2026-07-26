import type { TransactionRepository } from '@/domain/repositories/transaction.repository.js'
import { Transaction } from '@/domain/entities/transaction.entity.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'
import { buildMeta, type PaginatedOutput, type PaginationInput } from '@/shared/types/pagination.js'

export class InMemoryTransactionRepository implements TransactionRepository {
    public items: Transaction[] = []

    async findById(id: UniqueEntityId): Promise<Transaction | null> {
        return this.items.find((t) => t.id.equals(id)) ?? null
    }

    async findByIdempotencyKey(key: string): Promise<Transaction | null> {
        return this.items.find((t) => t.idempotencyKey === key) ?? null
    }

    async findAllByCustomerId(customerId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<Transaction>> {
        const { page, limit } = pagination;
        const filtered = this.items.filter((t) => t.customerId.equals(customerId));
        const total = filtered.length;
        const data = filtered.slice((page -1) * limit, page * limit);

        return { data, meta: buildMeta(total, pagination) }
    }

    async findAllByMerchantId(merchantId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<Transaction>> {
        const { page, limit } = pagination;
        const filtered = this.items.filter((t) => t.merchantId.equals(merchantId));
        const total = filtered.length;
        const data = filtered.slice((page -1) * limit, page * limit);

        return { data, meta: buildMeta(total, pagination) }
    }

    async save(transaction: Transaction): Promise<void> {
        this.items.push(transaction)
    }

    async update(transaction: Transaction): Promise<void> {
        const index = this.items.findIndex((t) => t.id.equals(transaction.id))
        if (index >= 0) this.items[index] = transaction
    }
}