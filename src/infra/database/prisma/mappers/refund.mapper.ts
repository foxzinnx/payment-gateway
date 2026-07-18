import { Refund, type RefundStatus } from "@/domain/entities/refund.entity.js";
import { Money, type Currency } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Refund as PrismaRefund } from "generated/prisma/client.js";

export class RefundMapper {
    static toDomain(raw: PrismaRefund): Refund {
        return Refund.reconstitute(
            {
                transactionId: new UniqueEntityId(raw.transactionId),
                merchantId: new UniqueEntityId(raw.merchantId),
                customerId: new UniqueEntityId(raw.customerId),
                amount: Money.create(raw.amountInCents, raw.currency as Currency),
                currency: raw.currency as Currency,
                reason: raw.reason,
                status: raw.status as RefundStatus,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(refund: Refund){
        return {
            id: refund.id.value,
            transactionId: refund.transactionId.value,
            merchantId: refund.merchantId.value,
            customerId: refund.customerId.value,
            amountInCents: refund.amount.amountInCents,
            currency: refund.currency,
            reason: refund.reason ?? null,
            status: refund.status,
            createdAt: refund.createdAt,
            updatedAt: refund.updatedAt
        }
    }
}