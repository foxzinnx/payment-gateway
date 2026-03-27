import { z } from 'zod'

export const registerCustomerSchema = z.object({
  name: z.string('Name is required').min(3).max(100),
  email: z.email('Email is required'),
  cpf: z.string('CPF is required').min(11).max(14),
  password: z.string('Password is required' ).min(6).max(100),
  phone: z.string().optional(),
})

export const registerMerchantSchema = z.object({
  name: z.string('Name is required').min(3).max(150),
  tradeName: z.string('Trade name is required').min(3).max(150),
  email: z.email('Email is required'),
  cnpj: z.string('CNPJ is required').min(14).max(18),
  password: z.string('Password is required').min(6).max(100),
})

export const loginSchema = z.object({
  email: z.email('Email is required'),
  password: z.string('Password is required'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string('Refresh token is required'),
})