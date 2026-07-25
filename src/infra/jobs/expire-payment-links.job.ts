import cron from 'node-cron'
import { ExpirePaymentLinksUseCase } from "@/application/use-cases/payment-link/expire-payment-links.use-case.js";
import { PrismaPaymentLinkRepository } from "../database/prisma/repositories/prisma-payment-link.repository.js";

const paymentLinkRepository = new PrismaPaymentLinkRepository();
const expirePaymentLinksUseCase = new ExpirePaymentLinksUseCase(paymentLinkRepository);

export function startExpirePaymentLinksJob(): void {
    cron.schedule('0 * * * *', async () => {
        console.log(`[CRON] Running expire-payment-links job at ${new Date().toISOString}`);

        try {
            const result = await expirePaymentLinksUseCase.execute();

            if(result.expired > 0){
                console.log(`[CRON] expire-payment-links: ${result.expired} link(s) expired successfully`)
            } else {
                console.log(`[CRON] expire-payment-links: no links to expire`)
            }
        } catch (error) {
            console.error('[CRON] expire-payment-links failed:', error);
        }
    }, {
        timezone: 'America/Sao_Paulo'
    });

    console.log('[CRON] expire-payment-links job scheduled, runs every hour');
}