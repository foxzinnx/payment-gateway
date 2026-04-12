import type { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { PaymentLinkMapper } from "../mappers/payment-link.mapper.js";

export class PrismaPaymentLinkRepository implements PaymentLinkRepository {
    async findById(id: UniqueEntityId): Promise<PaymentLink | null> {
        const raw = await prisma.paymentLink.findUnique({
            where: { id: id.value }
        });
        if(!raw) return null;

        return PaymentLinkMapper.toDomain(raw);
    }

    async findByCode(code: string): Promise<PaymentLink | null> {
        const raw = await prisma.paymentLink.findUnique({
            where: { code }
        });
        if(!raw) return null;

        return PaymentLinkMapper.toDomain(raw);
    }

    async findAllByMerchantId(merchantId: UniqueEntityId): Promise<PaymentLink[]> {
        const raws = await prisma.paymentLink.findMany({
            where: { merchantId: merchantId.value },
            orderBy: { createdAt: 'desc' }
        });

        return raws.map(PaymentLinkMapper.toDomain)
    }

    async save(paymentLink: PaymentLink): Promise<void> {
        await prisma.paymentLink.create({
            data: PaymentLinkMapper.toPrisma(paymentLink)
        });
    }

    async update(paymentLink: PaymentLink): Promise<void> {
        const data = PaymentLinkMapper.toPrisma(paymentLink);
        await prisma.paymentLink.update({
            where: { id: data.id },
            data
        });
    }

}