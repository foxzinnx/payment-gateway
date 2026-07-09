import type { Deposit } from "@/domain/entities/deposit.entity.js";
import type { DepositRepository } from "@/domain/repositories/deposit.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { DepositMapper } from "../mappers/deposit.mapper.js";

export class PrismaDepositRepository implements DepositRepository {
    async findById(id: UniqueEntityId): Promise<Deposit | null> {
        const raw = await prisma.deposit.findUnique({
            where: { id: id.value }
        })
        if(!raw) return null;
        return DepositMapper.toDomain(raw);
    }

    async findAllByCustomerId(customerId: UniqueEntityId): Promise<Deposit[]> {
        const raws = await prisma.deposit.findMany({
            where: { customerId: customerId.value },
            orderBy: { createdAt: 'asc' },
            take: 20
        })
        return raws.map(DepositMapper.toDomain)
    }

    async save(deposit: Deposit): Promise<void> {
        await prisma.deposit.create({
            data: DepositMapper.toPrisma(deposit)
        })
    }

    async update(deposit: Deposit): Promise<void> {
        const data = DepositMapper.toPrisma(deposit);
        await prisma.deposit.update({
            where: { id: data.id },
            data
        })
    }

}