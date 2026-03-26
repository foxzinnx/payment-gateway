import { z } from "zod";

export const createMerchantSchema = z.object({
    name: z.string('Name is required').min(3).max(100),
    tradeName: z.string('Trade name is required').min(3).max(100),
    email: z.email('Email is required'),
    cnpj: z.string('CNPJ is required').min(14).max(18)
});

export const updateMerchantSchema = z.object({
    tradeName: z.string().min(3).max(100).optional(),
    email: z.email().optional()
});

export const merchantIdSchema = z.object({
    id: z.uuid('Invalid merchant ID')
})