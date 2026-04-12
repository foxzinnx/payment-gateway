import type { PaymentLinkDetailsOutputDTO } from "@/application/dtos/payment-link.dto.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";

export class GetPaymentLinkDetailsUseCase{
    constructor(
        private readonly paymentLinkRepository: PaymentLinkRepository,
        private readonly merchantRepository: MerchantRepository
    ){}

    async execute(code: string): Promise<PaymentLinkDetailsOutputDTO>{
        const normalizedCode = code.toUpperCase().trim();

        const paymentLink = await this.paymentLinkRepository.findByCode(normalizedCode);
        if(!paymentLink) throw new NotFoundError('Payment link');

        paymentLink.validateForUse();

        const merchant = await this.merchantRepository.findById(paymentLink.merchantId);
        if(!merchant) throw new NotFoundError('Merchant');

        return paymentLink.toDetailsDTO(merchant.tradeName);
    }
}