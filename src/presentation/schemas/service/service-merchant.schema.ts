import { z } from 'zod'

export const serviceRegisterMerchantSchema = z.object({
    name: z.string('Name is required').min(3).max(150),
    tradeName: z.string('Trade name is required').min(3).max(150),
    email: z.email('Email is required'),
    cnpj: z.string('CNPJ is required').min(14).max(18),
    password: z.string('Password is required').min(6).max(100),
})