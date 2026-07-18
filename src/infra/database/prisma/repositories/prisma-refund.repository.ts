import type { Refund } from "@/domain/entities/refund.entity.js";
import type { RefundRepository } from "@/domain/repositories/refund.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { RefundMapper } from "../mappers/refund.mapper.js";

export class PrismaRefundRepository implements RefundRepository {
    async findById(id: UniqueEntityId): Promise<Refund | null> {
        const raw = await prisma.refund.findUnique({
            where: { id: id.value }
        });
        if(!raw) return null;

        return RefundMapper.toDomain(raw)
    }
    
    async findByTransactionId(transactionId: UniqueEntityId): Promise<Refund | null> {
        const raw = await prisma.refund.findUnique({
            where: { transactionId: transactionId.value }
        })
        if(!raw) return null;

        return RefundMapper.toDomain(raw);
    }

    async save(refund: Refund): Promise<void> {
        await prisma.refund.create({
            data: RefundMapper.toPrisma(refund)
        })
    }
}