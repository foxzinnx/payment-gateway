import type { CreatePaymentLinkInputDTO, PaymentLinkOutputDTO } from "@/application/dtos/payment-link.dto.js";
import { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import { ForbiddenError } from "@/domain/errors/forbidden.error.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class CreatePaymentLinkUseCase {
    constructor(
        private readonly paymentLinkRepository: PaymentLinkRepository,
        private readonly merchantRepository: MerchantRepository,
        private readonly walletRepository: WalletRepository
    ){}

    async execute(merchantId: string, input: CreatePaymentLinkInputDTO): Promise<PaymentLinkOutputDTO>{
        const merchantIdVO = new UniqueEntityId(merchantId);
        
        const merchant = await this.merchantRepository.findById(merchantIdVO);
        if(!merchant) throw new NotFoundError('Merchant');

        if(!merchant.isActive){
            throw new ForbiddenError('Inactive merchants cannot create payment links')
        }

        const merchantWallet = await this.walletRepository.findByOwnerId(merchantIdVO);
        if(!merchantWallet){
            throw new ForbiddenError('You need to have an active wallet to generate payment links')
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