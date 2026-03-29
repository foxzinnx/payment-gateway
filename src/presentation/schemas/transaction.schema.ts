import { z } from 'zod'

export const createTransactionSchema = z.object({
  merchantId: z.uuid('Merchant ID is required'),
  amountInCents: z
    .number('Amount is required')
    .int('Amount must be an integer')
    .positive('Amount must be positive'),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  description: z.string().max(255).optional(),
  idempotencyKey: z.uuid().optional(),
})

export const transactionIdSchema = z.object({
  id: z.uuid('Invalid transaction ID'),
})