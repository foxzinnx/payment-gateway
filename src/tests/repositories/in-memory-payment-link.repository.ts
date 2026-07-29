import type { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { type PaginationInput, type PaginatedOutput, buildMeta } from "@/shared/types/pagination.js";

export class InMemoryPaymentLinkRepository implements PaymentLinkRepository {
    public items: PaymentLink[] = [];
    
    async findById(id: UniqueEntityId): Promise<PaymentLink | null> {
        return this.items.find((p) => p.id.equals(id)) ?? null;
    }

    async findByCode(code: string): Promise<PaymentLink | null> {
        return this.items.find((p) => p.code === code) ?? null;
    }
    
    async findAllByMerchantId(merchantId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<PaymentLink>> {
        const { page, limit } = pagination;
        const filtered = this.items.filter((p) => p.merchantId.equals(merchantId));
        const total = filtered.length;
        const data = filtered.slice((page - 1) * limit, page * limit);

        return { data, meta: buildMeta(total, pagination)}
    }
    
    async findAllExpiredActive(): Promise<PaymentLink[]> {
        const now = new Date();
        return this.items.filter((p) => p.status === 'ACTIVE' && p.expiresAt < now);
    }

    async save(paymentLink: PaymentLink): Promise<void> {
        this.items.push(paymentLink);
    }
    
    async update(paymentLink: PaymentLink): Promise<void> {
        const index = this.items.findIndex((p) => p.id.equals(paymentLink.id));
        if(index > 0) this.items[index] = paymentLink;
    }

    async updateMany(paymentLinks: PaymentLink[]): Promise<void> {
        for(const paymentLink of paymentLinks){
            const index = this.items.findIndex((p) => p.id.equals(paymentLink.id));
            if(index > 0) this.items[index] = paymentLink;
        }   
    }
}