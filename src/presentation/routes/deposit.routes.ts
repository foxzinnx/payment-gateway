import type { FastifyInstance } from "fastify";
import { DepositController } from "../controllers/deposit.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";

const controller = new DepositController();

const depositData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: '4800d1f7-3006-419e-b376-4741de2c5452' },
        customerId: { type: 'string', format: 'uuid', example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5' },
        walletId: { type: 'string', format: 'uuid', example: '936585a5-3482-4868-8477-e819f4d4317e' },
        amountInCents: { type: 'integer', example: 5000 },
        amountFormatted: { type: 'string', example: '50.00' },
        currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], example: 'BRL' },
        status: {
            type: 'string',
            enum: ['PENDING', 'COMPLETED', 'FAILED'],
            description: 'COMPLETED means the wallet was credited. In this fictitious gateway, deposits are always approved immediately.',
            example: 'COMPLETED'
        },
        method: {
            type: 'string',
            enum: ['PIX', 'TED', 'BOLETO'],
            description: 'Simulated deposit method.',
            example: 'BRL'
        },
        createdAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' },
    },
    required: ['id', 'customerId', 'walletId', 'amountInCents', 'amountFormatted', 'currency', 'status', 'method', 'createdAt', 'updatedAt']
}

const unauthorizedResponse = {
    description: 'Missing token or non-customer token used',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Only customers can make deposits' }
    }
}

export async function depositRoutes(app: FastifyInstance): Promise<void>{
    app.post('/deposits', {
        schema: {
            tags: ['Deposit Routes'],
            summary: 'Create Deposit',
            description: 'Simulates an external bank deposit (PIX, TED, BOLETO) into the authenticated customer wallet. The deposit is processed immediately and the wallet balance is updated atomically. Only customers can make deposits. Merchants tokens return 401.',

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    amountInCents: {
                        type: 'integer',
                        minimum: 100,
                        maximum: 1000000,
                        description: 'Amount to deposit in cents. Minimum: 100 (R$ 1.00). Maximum: 1000000 (R$ 10,000.00).',
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
                        description: 'Simulated deposit method. Has no effect on processing in this fictitious gateway.',
                        example: 'PIX'
                    }
                },
                required: ['amountInCents']
            },

            response: {
                201: {
                    description: 'Deposit completed successfully. Wallet balance has been updated.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: depositData
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedResponse,
                404: {
                    description: 'Customer wallet not found. Create a wallet first via POST /wallets.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Wallet not found' }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeCustomer]
    }, controller.create.bind(controller));

    app.get('/deposits/me', {
        schema: {
            tags: ['Deposit Routes'],
            summary: 'List my deposits',
            description: 'Returns the 20 most recent deposits of the authenticated customer, ordered by creation date descending. Only customers can access this route.',

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Customer deposits retrieved successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'array',
                            items: depositData
                        }
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedResponse
            }
        },
        preHandler: [authenticate, authorizeCustomer]
    }, controller.listMine.bind(controller));
}