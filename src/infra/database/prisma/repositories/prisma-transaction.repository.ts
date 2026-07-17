import { Transaction } from "@/domain/entities/transaction.entity.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { TransactionMapper } from "../mappers/transaction.mapper.js";
import { buildMeta, type PaginatedOutput, type PaginationInput } from "@/shared/types/pagination.js";

export class PrismaTransactionRepository implements TransactionRepository{
    async findById(id: UniqueEntityId): Promise<Transaction | null> {
        const raw = await prisma.transaction.findUnique({
            where: { id: id.value }
        });

        if(!raw) return null;

        return TransactionMapper.toDomain(raw);
    }

    async findAllByCustomerId(customerId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<Transaction>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const [raws, total] = await prisma.$transaction([
            prisma.transaction.findMany({
                where: { customerId: customerId.value },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.transaction.count({
                where: { customerId: customerId.value }
            })
        ]);

        return {
            data: raws.map(TransactionMapper.toDomain),
            meta: buildMeta(total, pagination)
        }
    }

    async findAllByMerchantId(merchantId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<Transaction>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const [raws, total] = await prisma.$transaction([
            prisma.transaction.findMany({
                where: { merchantId: merchantId.value },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.transaction.count({
                where: { merchantId: merchantId.value }
            })
        ])
        
        return {
            data: raws.map(TransactionMapper.toDomain),
            meta: buildMeta(total, pagination)
        }
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