import type { FastifyInstance } from "fastify";
import { RefundController } from "../controllers/refund.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeMerchant } from "../middlewares/authorize.middleware.js";

const controller = new RefundController();

const refundData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: '4800d1f7-3006-419e-b376-4741de2c5452' },
        transactionId: { type: 'string', format: 'uuid', example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5' },
        merchantId: { type: 'string', format: 'uuid', example: '936585a5-3482-4868-8477-e819f4d4317e' },
        customerId: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
        amountInCents: {
            type: 'integer',
            description: 'Refunded amount in cents. Always equals the original transaction amount.',
            example: 5000
        },
        amountFormatted: { type: 'string', example: '50.00' },
        currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], example: 'BRL' },
        reason: {
            type: 'string',
            nullable: true,
            description: 'Optional reason provided by the merchant for the refund.',
            example: 'Product out of stock'
        },
        status: {
            type: 'string',
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            description: 'In this fictitious gateway, refunds are always completed immediately.',
            example: 'COMPLETED'
        },
        createdAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' }
    },
    required: ['id', 'transactionId', 'merchantId', 'customerId', 'amountInCents', 'amountFormatted', 'currency', 'reason', 'status', 'createdAt', 'updatedAt']
}

export async function refundRoutes(app: FastifyInstance): Promise<void>{
    app.post('/transactions/:transactionId/refund', {
        config: {
            rateLimit: {
                max: 10,
                timeWindow: '15 minutes',
                errorResponseBuilder: () => ({
                    status: 'error',
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many refund requests. Please try again in 15 minutes.'
                })
            }
        },

        schema: {
            tags: ['Refund Routes'],
            summary: 'Refund a transaction',
            description: 'Refunds an approved transaction. Only the merchant who received the payment can request a refund. The full transaction amount is returned to the customer — partial refunds are not supported. The merchant wallet is debited and the customer wallet is credited atomically. The transaction status changes to REFUNDED and cannot be refunded again.',

            params: {
                type: 'object',
                properties: {
                    transactionId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the transaction to refund. Must be APPROVED and belong to the authenticated merchant.',
                        example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                    }
                },
                required: ['transactionId']
            },

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    reason: {
                        type: 'string',
                        maxLength: 255,
                        description: 'Optional reason for the refund. Visible in the refund record.',
                        example: 'Product out of stock'
                    }
                }
            },

            response: {
                201: {
                    description: 'Refund completed successfully. Merchant wallet debited and customer wallet credited atomically.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: refundData
                    },
                    required: ['status', 'data']
                },
                401: {
                    description: 'Missing token, non-merchant token, or attempting to refund another merchant\'s transaction',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'You can only refund transactions you received' }
                    }
                },
                404: {
                    description: 'Transaction or wallet not found',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Transaction not found' }
                    }
                },
                409: {
                    description: 'Transaction has already been refunded',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'TRANSACTION_ALREADY_REFUNDED' },
                        message: { type: 'string', example: 'This transaction has already been refunded' }
                    }
                },
                422: {
                    description: 'Transaction cannot be refunded. Only APPROVED transactions are eligible',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'TRANSACTION_NOT_REFUNDABLE' },
                        message: { type: 'string', example: 'Only approved transactions can be refunded' }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeMerchant]
    }, controller.create.bind(controller));
}