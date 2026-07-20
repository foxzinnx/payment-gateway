import z from "zod";

export const createRefundSchema = z.object({
    reason: z.string().max(255).optional()
});

export const refundTransactionIdSchema = z.object({
    transactionId: z.uuid('Invalid transaction ID')
})