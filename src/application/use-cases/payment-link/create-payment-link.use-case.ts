import type { CreatePaymentLinkInputDTO, PaymentLinkOutputDTO } from "@/application/dtos/payment-link.dto.js";
import { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class CreatePaymentLinkUseCase {
    constructor(
        private readonly paymentLinkRepository: PaymentLinkRepository,
        private readonly merchantRepository: MerchantRepository
    ){}

    async execute(merchantId: string, input: CreatePaymentLinkInputDTO): Promise<PaymentLinkOutputDTO>{
        const merchantIdVO = new UniqueEntityId(merchantId);
        
        const merchant = await this.merchantRepository.findById(merchantIdVO);
        if(!merchant) throw new NotFoundError('Merchant');

        if(!merchant.isActive){
            throw new InvalidArgumentError('Inactive merchants cannot create payment links')
        }

        const paymentLink = PaymentLink.create({
            merchantId: merchantIdVO,
            amountInCents: input.amountInCents,
            currency: input.currency,
            description: input.description
        });

        await this.paymentLinkRepository.save(paymentLink);

        return paymentLink.toOutputDTO();
    }
}