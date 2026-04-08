import type { PaymentLink } from "../entities/payment-link.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface PaymentLinkRepository {
    findById(id: UniqueEntityId): Promise<PaymentLink | null>;
    findByCode(code: string): Promise<PaymentLink | null>;
    findAllByMerchantId(merchantId: UniqueEntityId): Promise<PaymentLink[]>;
    save(paymentLink: PaymentLink): Promise<void>;
    update(paymentLink: PaymentLink): Promise<void>;
}