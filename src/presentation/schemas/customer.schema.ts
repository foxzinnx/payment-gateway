import { z } from 'zod';

export const createCustomerSchema = z.object({
    name: z.string('Name is required').min(3).max(100),
    email: z.email('Email is required'),
    cpf: z.string('CPF is required').min(11).max(14),
    phone: z.string().optional(),
});

export const updateCustomerSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    email: z.email().optional(),
    phone: z.string().nullable().optional()
});

export const customerIdSchema = z.object({
    id: z.uuid('Invalid customer ID')
});