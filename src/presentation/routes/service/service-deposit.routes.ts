import { ServiceDepositController } from "@/presentation/controllers/service/service-deposit.controller.js";
import { authenticateApiKey } from "@/presentation/middlewares/authenticate-api-key.middleware.js";
import type { FastifyInstance } from "fastify";

const controller = new ServiceDepositController();

export async function serviceDepositRoutes(app: FastifyInstance): Promise<void>{
    app.post('/service/deposits', {
        config: {
            rateLimit: {
                max: 10,
                timeWindow: '15 minutes',
                errorResponseBuilder: () => ({
                    status: 'error',
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many deposit attempts. Please try again in 15 minutes.',
                })
            }
        },

        schema: {
            tags: ['Services Routes - Deposit'],
            summary: 'Create deposit (service)',
            description: 'Simulates an external deposit into a customer wallet on behalf of an external service (e.g. CapyFood). The wallet is credited immediately and atomically. Requires API Key authentication.',

            security: [{ apiKey: [] }],

            body: {
                type: 'object',
                properties: {
                    customerId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'PayFlow Customer ID',
                        example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                    },
                    amountInCents: {
                        type: 'integer',
                        minimum: 100,
                        maximum: 1000000,
                        description: 'Amount in cents. Minimum: 100 (R$1.00). Maximum: 1000000 (R$10,000.00).',
                        example: 5000
                    },
                    currency: {
                        type: 'string',
                        enum: ['BRL', 'USD', 'EUR'],
                        default: 'BRL',
                        example: 'BRL'
                    },
                    method: {
                        type: 'string',
                        enum: ['PIX', 'TED', 'BOLETO'],
                        default: 'PIX',
                        description: 'Simulated deposit method.',
                        example: 'PIX'
                    }
                },
                required: ['customerId', 'amountInCents']
            },

            response: {
                201: {
                    description: 'Deposit completed. Wallet has been credited.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            id: { type: 'string', format: 'uuid' },
                            customerId: { type: 'string', format: 'uuid' },
                            walletId: { type: 'string', format: 'uuid' },
                            amountInCents: { type: 'integer', example: 5000 },
                            amountFormatted: { type: 'string', example: '50.00' },
                            currency: { type: 'string', example: 'BRL' },
                            status: { type: 'string', enum: ['COMPLETED'], example: 'COMPLETED' },
                            method: { type: 'string', enum: ['PIX', 'TED', 'BOLETO'], example: 'PIX' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                401: {
                    description: 'Missing or invalid API key',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Invalid or revoked API key' }
                    }
                },
                404: {
                    description: 'Customer wallet not found',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Wallet not found' }
                    }
                }
            }
        },
        preHandler: [authenticateApiKey]
    }, controller.create.bind(controller));
}