import type { Transaction } from "../entities/transaction.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface TransactionRepository {
    findById(id: UniqueEntityId): Promise<Transaction | null>;
    findAllByCustomerId(customerId: UniqueEntityId): Promise<Transaction[]>;
    findByIdempotencyKey(key: string): Promise<Transaction | null>;
    save(transaction: Transaction): Promise<void>;
    update(transation: Transaction): Promise<void>;
}