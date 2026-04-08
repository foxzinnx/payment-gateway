import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { WalletMapper } from "../mappers/wallet.mapper.js";

export class PrismaWalletRepository implements WalletRepository {
    async findById(id: UniqueEntityId): Promise<Wallet | null> {
        const raw = await prisma.wallet.findUnique({
            where: { id: id.value }
        });

        if(!raw) return null

        return WalletMapper.toDomain(raw);
    }

    async findByOwnerId(ownerId: UniqueEntityId): Promise<Wallet | null> {
        const raw = await prisma.wallet.findUnique({
            where: { ownerId: ownerId.value }
        });

        if(!raw) return null

        return WalletMapper.toDomain(raw);
    }

    async save(wallet: Wallet): Promise<void> {
        const data = WalletMapper.toPrisma(wallet);

        await prisma.wallet.create({ data });
    }

    async update(wallet: Wallet): Promise<void> {
        const data = WalletMapper.toPrisma(wallet);

        await prisma.wallet.update({
            where: { id: data.id },
            data,
        });
    }

}