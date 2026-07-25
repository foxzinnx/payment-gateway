import type { ExpirePaymentLinksOutputDTO } from "@/application/dtos/payment-link.dto.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";

export class ExpirePaymentLinksUseCase{
    constructor(private readonly paymentLinkRepository: PaymentLinkRepository){}

    async execute(): Promise<ExpirePaymentLinksOutputDTO>{
        const expiredLinks = await this.paymentLinkRepository.findAllExpiredActive();

        if(expiredLinks.length === 0){
            return { expired: 0, processedAt: new Date() }
        }

        expiredLinks.forEach((link) => link.markAsExpired());

        await this.paymentLinkRepository.updateMany(expiredLinks);

        return {
            expired: expiredLinks.length,
            processedAt: new Date()
        }
    }
}