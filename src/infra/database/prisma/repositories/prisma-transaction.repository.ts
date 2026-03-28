import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { ITransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { TransactionMapper } from "../mappers/transaction.mapper.js";

export class PrismaTransactionRepository implements ITransactionRepository{
    async findById(id: UniqueEntityId): Promise<Transaction | null> {
        const raw = await prisma.transaction.findUnique({
            where: { id: id.value }
        });

        if(!raw) return null;

        return TransactionMapper.toDomain(raw);
    }
    async findByIdempotencyKey(key: string): Promise<Transaction | null> {
        const raw = await prisma.transaction.findUnique({
            where: { idempotencyKey: key }
        });

        if(!raw) return null;

        return TransactionMapper.toDomain(raw);
    }

    async save(transaction: Transaction): Promise<void> {
        const data = TransactionMapper.toPrisma(transaction);
        await prisma.transaction.create({ data });
    }

    async update(transation: Transaction): Promise<void> {
        const data = TransactionMapper.toPrisma(transation);
        await prisma.transaction.update({
            where: { id: data.id },
            data
        })
    }

}