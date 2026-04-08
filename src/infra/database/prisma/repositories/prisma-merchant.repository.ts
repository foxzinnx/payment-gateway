import type { Merchant } from "@/domain/entities/merchant.entity.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { MerchantMapper } from "../mappers/merchant.mapper.js";

export class PrismaMerchantRepository implements MerchantRepository {
    async findById(id: UniqueEntityId): Promise<Merchant | null> {
        const raw = await prisma.merchant.findUnique({
            where: { id: id.value }
        });

        if(!raw) return null

        return MerchantMapper.toDomain(raw);
    }

    async findByEmail(email: string): Promise<Merchant | null> {
        const raw = await prisma.merchant.findUnique({
            where: { email }
        });

        if(!raw) return null

        return MerchantMapper.toDomain(raw);
    }

    async findByCnpj(cnpj: string): Promise<Merchant | null> {
        const digits = cnpj.replace(/\D/g, '');

        const raw = await prisma.merchant.findUnique({
            where: { cnpj: digits }
        });

        if(!raw) return null

        return MerchantMapper.toDomain(raw);
    }
    
    async save(merchant: Merchant): Promise<void> {
        const data = MerchantMapper.toPrisma(merchant);

        await prisma.merchant.create({ data });
    }

    async update(merchant: Merchant): Promise<void> {
        const data = MerchantMapper.toPrisma(merchant);
        
        await prisma.merchant.update({
            where: { id: data.id },
            data,
        });
    }

}