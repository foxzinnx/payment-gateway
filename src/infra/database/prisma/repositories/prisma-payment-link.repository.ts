import type { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { PaymentLinkMapper } from "../mappers/payment-link.mapper.js";
import { buildMeta, type PaginatedOutput, type PaginationInput } from "@/shared/types/pagination.js";

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

    async findAllByMerchantId(merchantId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<PaymentLink>> {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const [raws, total] = await prisma.$transaction([
            prisma.paymentLink.findMany({
                where: { merchantId: merchantId.value },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.paymentLink.count({
                where: { merchantId: merchantId.value  }
            })
        ])


        return {
            data: raws.map(PaymentLinkMapper.toDomain),
            meta: buildMeta(total, pagination)
        }
    }

    async findAllExpiredActive(): Promise<PaymentLink[]> {
        const raws = await prisma.paymentLink.findMany({
            where: {
                status: 'ACTIVE',
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        return raws.map(PaymentLinkMapper.toDomain)
    }

    async updateMany(paymentLinks: PaymentLink[]): Promise<void>{
        await prisma.$transaction(
            paymentLinks.map((link) =>
                prisma.paymentLink.update({
                    where: { id: link.id.value },
                    data: {
                        status: link.status,
                        updatedAt: link.updatedAt
                    }
                })
            )
        )
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