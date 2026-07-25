import { z } from 'zod'

export const serviceCreateTransactionSchema = z.object({
    customerId: z.uuid('Customer ID is required'),
    merchantId: z.uuid('Merchant ID is required'),
    amountInCents: z
        .number('Amount is required')
        .int('Amount must be an integer')
        .positive('Amount must be positive')
        .min(100, 'Minimum amount is R$1.00')
        .max(1000000, 'Maximum amount is R$10,000.00'),
    currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
    description: z.string().max(255).optional(),
    idempotencyKey: z.uuid().optional(),
    metadata: z.record(z.string(),z.unknown()).optional(),
})

export const serviceRefundTransactionSchema = z.object({
    merchantId: z.uuid('Merchant ID is required'),
    reason: z.string().max(255).optional(),
})

export const serviceTransactionIdSchema = z.object({
    transactionId: z.uuid('Invalid transaction ID'),
})