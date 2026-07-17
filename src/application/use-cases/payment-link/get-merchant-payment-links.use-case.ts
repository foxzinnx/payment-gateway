import type { PaymentLinkOutputDTO } from "@/application/dtos/payment-link.dto.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { PaginatedOutput, PaginationInput } from "@/shared/types/pagination.js";

export class GetMerchantPaymentLinksUseCase {
    constructor(private readonly paymentLinkRepository: PaymentLinkRepository){}

    async execute(merchantId: string, pagination: PaginationInput): Promise<PaginatedOutput<PaymentLinkOutputDTO>>{
        const merchantIdVO = new UniqueEntityId(merchantId);
        const result = await this.paymentLinkRepository.findAllByMerchantId(merchantIdVO, pagination);

        return {
            data: result.data.map((link) => link.toOutputDTO()),
            meta: result.meta
        }
    }
}