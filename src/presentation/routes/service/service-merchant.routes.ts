import { ServiceMerchantController } from "@/presentation/controllers/service/service-merchant.controller.js";
import { authenticateApiKey } from "@/presentation/middlewares/authenticate-api-key.middleware.js";
import type { FastifyInstance } from "fastify";

const controller = new ServiceMerchantController();

export async function serviceMerchantRoutes(app: FastifyInstance): Promise<void>{
    app.post('/service/merchants', {
        schema: {
            tags: ['Service Routes - Merchant'],
            summary: 'Register merchant (service)',
            description: 'Registers a restaurant owner as a merchant in PayFlow. Creates the merchant and their wallet automatically.',
            security: [{ apiKey: [] }]
        },
        preHandler: [authenticateApiKey]
    }, controller.register.bind(controller));

    app.get('/service/merchants/:merchantId/wallet', {
        schema: {
            tags: ['Service Routes - Merchant'],
            summary: 'Get merchant wallet (service)',
            description: 'Returns the wallet balance of a merchant. Used by CapyFood to display the restaurant owner balance.',

            params: {
                type: 'object',
                properties: {
                    merchantId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'PayFlow merchant ID',
                        example: '936585a5-3482-4868-8477-e819f4d4317e'
                    }
                },
                required: ['merchantId']
            },

            security: [{ apiKey: [] }],

            response: {
                200: {
                    description: 'Merchant wallet retrieved successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                ownerId: { type: 'string', format: 'uuid' },
                                ownerType: { type: 'string', enum: ['MERCHANT'], example: 'MERCHANT' },
                                balanceInCents: { type: 'integer', example: 5000 },
                                balanceFormatted: { type: 'string', example: '50.00' },
                                currency: { type: 'string', example: 'BRL' },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
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
                    description: 'Merchant wallet not found',
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
    }, controller.getWallet.bind(controller));
}