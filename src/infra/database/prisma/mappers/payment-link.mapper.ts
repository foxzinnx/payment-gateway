import { PaymentLink, type PaymentLinkStatus } from "@/domain/entities/payment-link.entity.js";
import { Money, type Currency } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { PaymentLink as PrismaPaymentLink } from "generated/prisma/client.js";

export class PaymentLinkMapper {
    static toDomain(raw: PrismaPaymentLink): PaymentLink {
        return PaymentLink.reconstitute(
            {
                code: raw.code,
                merchantId: new UniqueEntityId(raw.merchantId),
                amount: Money.create(raw.amountInCents, raw.currency as Currency),
                currency: raw.currency as Currency,
                description: raw.description,
                status: raw.status as PaymentLinkStatus,
                expiresAt: raw.expiresAt,
                usedAt: raw.usedAt,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(paymentLink: PaymentLink) {
        return {
            id: paymentLink.id.value,
            code: paymentLink.code,
            merchantId: paymentLink.merchantId.value,
            amountInCents: paymentLink.amount.amountInCents,
            currency: paymentLink.currency,
            description: paymentLink.description,
            status: paymentLink.status,
            expiresAt: paymentLink.expiresAt,
            usedAt: paymentLink.usedAt,
            createdAt: paymentLink.createdAt,
            updatedAt: paymentLink.updatedAt,
        }
    }
}