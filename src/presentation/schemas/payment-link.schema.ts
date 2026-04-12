import z from "zod";

export const createPaymentLinkSchema = z.object({
    amountInCents: z
        .number('Amount is required')
        .int('Amount must be an integer')
        .positive('Amount must be positive'),
    currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
    description: z.string().max(255).optional()
});

export const paymentLinkCodeSchema = z.object({
    code: z.string().min(1, 'Code is required')
});

export const payWithLinkSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    idempotencyKey: z.uuid().optional()
});