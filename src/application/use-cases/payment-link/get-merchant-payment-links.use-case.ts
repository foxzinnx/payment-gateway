import type { PaymentLinkOutputDTO } from "@/application/dtos/payment-link.dto.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetMerchantPaymentLinksUseCase {
    constructor(private readonly paymentLinkRepository: PaymentLinkRepository){}

    async execute(merchantId: string): Promise<PaymentLinkOutputDTO[]>{
        const merchantIdVO = new UniqueEntityId(merchantId);
        const paymentLinks = await this.paymentLinkRepository.findAllByMerchantId(merchantIdVO);

        return paymentLinks.map((link) => link.toOutputDTO())
    }
}