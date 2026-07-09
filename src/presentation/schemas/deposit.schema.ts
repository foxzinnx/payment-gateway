import z from "zod";

export const createDepositSchema = z.object({
    amountInCents: z
        .number('Amount is required')
        .int('Amount must be an integer')
        .positive('Amount must be positive')
        .min(100, 'Minimum deposit is R$ 1.00')
        .max(1000000, 'Maximum deposit is R$ 10,000.00'),
    currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
    method: z.enum(['PIX', 'TED', 'BOLETO']).default('PIX')
})