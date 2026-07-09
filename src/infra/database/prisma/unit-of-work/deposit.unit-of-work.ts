import type { Deposit } from "@/domain/entities/deposit.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { DepositUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import { prisma } from "../prisma.client.js";
import { DepositMapper } from "../mappers/deposit.mapper.js";

export class PrismaDepositUnitOfWork implements DepositUnitOfWork {
    async execute(operations: { deposit: Deposit; wallet: Wallet; }): Promise<void> {
        const { deposit, wallet } = operations;

        await prisma.$transaction([
            prisma.deposit.create({
                data: DepositMapper.toPrisma(deposit)
            }),
            prisma.wallet.update({
                where: { id: wallet.id.value },
                data: {
                    balance: wallet.balance.amountInCents,
                    updatedAt: wallet.updatedAt
                }
            })
        ]);
    }
}