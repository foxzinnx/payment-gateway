import z from "zod"

export const serviceRegisterCustomerSchema = z.object({
    name: z.string('Name is required').min(3).max(100),
    email: z.email('Email is required'),
    cpf: z.string('CPF is required').min(11).max(14),
    password: z.string('Password is required').min(6).max(100),
    phone: z.string().optional(),
})

export const serviceCustomerIdSchema = z.object({
    customerId: z.uuid('Invalid customer ID'),
})