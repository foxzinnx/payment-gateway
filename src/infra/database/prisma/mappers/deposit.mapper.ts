import { Deposit, type DepositMethod, type DepositStatus } from "@/domain/entities/deposit.entity.js";
import { Money, type Currency } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Deposit as PrismaDeposit } from "generated/prisma/client.js";

export class DepositMapper {
    static toDomain(raw: PrismaDeposit): Deposit {
        return Deposit.reconstitute(
            {
                customerId: new UniqueEntityId(raw.customerId),
                walletId: new UniqueEntityId(raw.walletId),
                amount: Money.create(raw.amountInCents, raw.currency as Currency),
                currency: raw.currency as Currency,
                status: raw.status as DepositStatus,
                method: raw.method as DepositMethod,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(deposit: Deposit){
        return {
            id: deposit.id.value,
            customerId: deposit.customerId.value,
            walletId: deposit.walletId.value,
            amountInCents: deposit.amount.amountInCents,
            currency: deposit.currency,
            status: deposit.status,
            method: deposit.method,
            createdAt: deposit.createdAt,
            updatedAt: deposit.updatedAt
        }
    }
}