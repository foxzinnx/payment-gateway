import type { Refund } from "@/domain/entities/refund.entity.js";
import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { RefundUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import { prisma } from "../prisma.client.js";
import { RefundMapper } from "../mappers/refund.mapper.js";

export class PrismaRefundUnitOfWork implements RefundUnitOfWork {
    async execute(operations: { refund: Refund; transaction: Transaction; merchantWallet: Wallet; customerWallet: Wallet; }): Promise<void> {
        const { refund, transaction, merchantWallet,customerWallet } = operations;

        await prisma.$transaction([
            prisma.refund.create({
                data: RefundMapper.toPrisma(refund)
            }),

            prisma.transaction.update({
                where: { id: transaction.id.value },
                data: {
                    status: transaction.status,
                    updatedAt: transaction.updatedAt
                }
            }),

            prisma.wallet.update({
                where: { id: merchantWallet.id.value },
                data: {
                    balance: merchantWallet.balance.amountInCents,
                    updatedAt: merchantWallet.updatedAt
                }
            }),

            prisma.wallet.update({
                where: { id: customerWallet.id.value },
                data: {
                    balance: customerWallet.balance.amountInCents,
                    updatedAt: customerWallet.updatedAt
                }
            })
        ])
    }

}