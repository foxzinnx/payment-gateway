import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { PaymentUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import { prisma } from "../prisma.client.js";
import { TransactionMapper } from "../mappers/transaction.mapper.js";

export class PrismaPaymentUnitOfWork implements PaymentUnitOfWork {
    async execute(operations: { transaction: Transaction; customerWallet: Wallet; merchantWallet: Wallet; }): Promise<void> {
        const { transaction, customerWallet, merchantWallet } = operations;

        await prisma.$transaction([
            prisma.transaction.create({
                data: TransactionMapper.toPrisma(transaction)
            }),

            prisma.wallet.update({
                where: { id: customerWallet.id.value },
                data: {
                    balance: customerWallet.balance.amountInCents,
                    updatedAt: customerWallet.updatedAt
                }
            }),

            prisma.wallet.update({
                where: { id: merchantWallet.id.value },
                data: {
                    balance: merchantWallet.balance.amountInCents,
                    updatedAt: merchantWallet.updatedAt
                }
            })
        ])
    }

}