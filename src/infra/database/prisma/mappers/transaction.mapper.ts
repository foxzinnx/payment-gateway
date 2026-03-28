import { Transaction, type TransactionStatus } from "@/domain/entities/transaction.entity.js";
import { Money, type Currency } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Transaction as PrismaTransaction } from "generated/prisma/client.js";

export class TransactionMapper {
    static toDomain(raw: PrismaTransaction): Transaction {
        return Transaction.reconstitute(
            {
                customerId: new UniqueEntityId(raw.customerId),
                merchantId: new UniqueEntityId(raw.merchantId),
                amount: Money.create(raw.amountInCents, raw.currency as Currency),
                currency: raw.currency as Currency,
                status: raw.status as TransactionStatus,
                description: raw.description,
                idempotencyKey: raw.idempotencyKey,
                denialReason: raw.denialReason,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(transaction: Transaction){
        return {
            id: transaction.id.value,
            customerId: transaction.customerId.value,
            merchantId: transaction.merchantId.value,
            amountInCents: transaction.amount.amountInCents,
            currency: transaction.currency,
            status: transaction.status,
            description: transaction.description,
            idempotencyKey: transaction.idempotencyKey,
            denialReason: transaction.denialReason,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        }
    }
}