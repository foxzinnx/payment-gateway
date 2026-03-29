import type { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedError } from '@/domain/errors/unauthorized.error.js'

export async function authorizeCustomer(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (request.user.type !== 'CUSTOMER') {
    throw new UnauthorizedError('Only customers can access this resource')
  }
}

export async function authorizeMerchant(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (request.user.type !== 'MERCHANT') {
    throw new UnauthorizedError('Only merchants can access this resource')
  }
}