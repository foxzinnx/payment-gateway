import { z } from 'zod';

export const createWalletSchema = z.object({
    currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL')
});

export const creditWalletSchema = z.object({
    amountInCents: z
        .number('Amount is required')
        .int('Amount must be an integer')
        .positive('Amount must be positive')
});

export const debitWalletSchema = z.object({
    amountInCents: z
        .number('Amount is required')
        .int('Amount must be an integer')
        .positive('Amount must be positive')
});

export const walletIdSchema = z.object({
    id: z.uuid('Invalid wallet ID')
});

export const ownerIdSchema = z.object({
    ownerId: z.uuid('Invalid owner ID')
})