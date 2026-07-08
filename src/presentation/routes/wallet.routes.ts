import type { FastifyInstance } from "fastify";
import { WalletController } from "../controllers/wallet.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const controller = new WalletController();

const walletData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: '936585a5-3482-4868-8477-e819f4d4317e' },
        ownerId: { type: 'string', format: 'uuid', example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5' },
        ownerType: { type: 'string', enum: ['CUSTOMER', 'MERCHANT'], example: 'CUSTOMER' },
        balanceInCents: { type: 'integer', example: 0 },
        balanceFormatted: { type: 'string', example: '0.00' },
        currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], example: 'BRL' },
        createdAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' }
    },
    required: ['id', 'ownerId', 'ownerType', 'balanceInCents', 'balanceFormatted', 'currency', 'createdAt', 'updatedAt']
}

export async function walletRoutes(app: FastifyInstance): Promise<void> {
    app.post('/wallets', { 
        schema: {
            tags: ['Wallet Routes'],
            summary: 'Create wallet',
            description: 'Creates a digital wallet for the authenticated user. The ownerId and ownerType are automatically extracted from the JWT token. Each user can only have one wallet.',

            security: [
                { bearerAuth: [] }
            ],

            body: {
                type: 'object',
                properties: {
                    currency: {
                        type: 'string',
                        enum: ['BRL', 'USD', 'EUR'],
                        example: 'BRL'
                    }
                },
            },

            response: {
                201: {
                    description: 'Wallet created successfully',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        data: walletData,
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'Missing or invalid authorization token',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Missing authorization token' }
                    }
                },

                409: {
                    description: 'This owner already has a wallet',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'INVALID_ARGUMENT'
                        },
                        message: {
                            type: 'string',
                            example: 'This owner already has a wallet'
                        }
                    }
                }
            }
        },
        preHandler: authenticate
     } ,controller.create.bind(controller));
    app.get('/wallets/me', { 
        schema: {
            tags: ['Wallet Routes'],
            summary: 'Get My Wallet',
            description: 'Returns the wallet of the currently authenticated user. The wallet is identified by the JWT token, so no parameters are needed.',

            security: [
                { bearerAuth: [] }
            ],

            response: {
                200: {
                    description: 'Wallet found successfully',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        data: walletData,
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'Missing or invalid authorization token',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Missing authorization token' }
                    }
                },

                404: {
                    description: 'Wallet not found',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'NOT_FOUND'
                        },
                        message: {
                            type: 'string',
                            example: 'Wallet not found'
                        }
                    }
                }
            }
        },
        preHandler: authenticate
     } ,controller.getMyWallet.bind(controller));
}