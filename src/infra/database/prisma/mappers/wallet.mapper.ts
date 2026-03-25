import { Wallet } from "@/domain/entities/wallet.entity.js";
import { Money, type Currency } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Wallet as PrismaWallet, WalletOwnerType } from "generated/prisma/client.js";

export class WalletMapper {
    static toDomain(raw: PrismaWallet): Wallet {
        return Wallet.reconstitute(
            {
                ownerId: new UniqueEntityId(raw.ownerId),
                ownerType: raw.ownerType as WalletOwnerType,
                balance: Money.create(raw.balance, raw.currency as Currency),
                currency: raw.currency as Currency,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(wallet: Wallet){
        return {
            id: wallet.id.value,
            ownerId: wallet.ownerId.value,
            ownerType: wallet.ownerType,
            balance: wallet.balance.amountInCents,
            currency: wallet.currency,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt
        }
    }
}