import type { FastifyInstance } from "fastify";
import { TransactionController } from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";
import { container } from "@/infra/container/index.js";

const controller = new TransactionController();

const transactionData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: '4800d1f7-3006-419e-b376-4741de2c5452' },
        customerId: { type: 'string', format: 'uuid', example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5' },
        merchantId: { type: 'string', format: 'uuid', example: '936585a5-3482-4868-8477-e819f4d4317e' },
        amountInCents: {
            type: 'integer',
            description: 'Transaction amount in cents (e.g., 2000 = R$20.00).',
            example: 2000
        },
        amountFormatted: {
            type: 'string',
            description: 'Human-readable amount with two decimal places.',
            example: '20.00'
        },
        currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], example: 'BRL' },
        status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'FAILED'],
            description: 'APPROVED means funds were moved. FAILED means the authorizer denied the transaction — no funds were moved.',
            example: 'APPROVED'
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'Pagamento de produto X'
        },
        denialReason: {
            type: 'string',
            nullable: true,
            description: 'Populated only when status is FAILED. Describes why the transaction was denied.',
            example: null
        },
        createdAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' }
    },
    required: ['id', 'customerId', 'merchantId', 'amountInCents', 'amountFormatted', 'currency', 'status', 'description', 'denialReason', 'createdAt', 'updatedAt']
}

const unauthorizedResponse = {
    description: 'Missing or invalid authorization token, or non-customer token used',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Only customers can access this resource' }
    }
}

const notFoundResponse = {
    description: 'Transaction not found',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'NOT_FOUND' },
        message: { type: 'string', example: 'Transaction not found' }
    }
}

export async function transactionRoutes(app: FastifyInstance): Promise<void> {

    app.post('/transactions', {
        schema: {
            tags: ['Transaction Routes'],
            summary: 'Create transaction',
            description: 'Creates a transaction from the authenticated customer to a merchant. Only customers can create transactions — merchant tokens return 401. The transaction passes through the authorization service before being approved or failed. If an idempotencyKey is provided and a transaction with that key already exists, the original result is returned without processing a new transaction.',

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    merchantId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the target merchant.',
                        example: '936585a5-3482-4868-8477-e819f4d4317e'
                    },
                    amountInCents: {
                        type: 'integer',
                        minimum: 100,
                        maximum: 1000000,
                        description: 'Amount to transfer in cents. Minimum: 100 (R$1.00). Maximum: 1000000 (R$10,000.00).',
                        example: 2000
                    },
                    currency: {
                        type: 'string',
                        enum: ['BRL', 'EUR', 'USD'],
                        default: 'BRL',
                        example: 'BRL'
                    },
                    description: {
                        type: 'string',
                        maxLength: 255,
                        description: 'Optional description for the transaction.',
                        example: 'Pagamento de produto X'
                    },
                    idempotencyKey: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Optional UUID to prevent duplicate transactions. If a transaction with this key already exists, the original result is returned.',
                        example: 'aacb8331-541b-4496-8c96-ce443f40c5d8'
                    }
                },
                required: ['merchantId', 'amountInCents', 'currency']
            },

            response: {
                201: {
                    description: 'Transaction processed. Check the status field — APPROVED means funds were moved, FAILED means the authorizer denied it (no funds moved). A FAILED transaction still returns 201 with status FAILED and a denialReason.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: transactionData
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedResponse,
                404: {
                    description: 'Customer, merchant, or wallet not found',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Merchant not found' }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeCustomer]
    }, controller.create.bind(controller));

    app.get('/transactions/:id', {
        schema: {
            tags: ['Transaction Routes'],
            summary: 'Get transaction by ID',
            description: 'Returns a transaction by its UUID. Any authenticated user can retrieve a transaction by ID.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the transaction to retrieve.',
                        example: '4800d1f7-3006-419e-b376-4741de2c5452'
                    }
                },
                required: ['id']
            },

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Transaction found successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: transactionData
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
                404: notFoundResponse
            }
        },
        preHandler: authenticate
    }, controller.getById.bind(controller));

    app.get('/transactions/customer/me', {
        schema: {
            tags: ['Transaction Routes'],
            summary: 'List my transactions',
            description: 'Returns the 20 most recent transactions of the authenticated customer, ordered by creation date descending. Only customers can access this route — merchant tokens return 401.',

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Customer transactions retrieved successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'array',
                            items: transactionData
                        }
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedResponse
            }
        },
        preHandler: [authenticate, authorizeCustomer]
    }, async (request, reply) => {
        const customerId = request.user.sub
        const output = await container.getCustomerTransactions.execute(customerId)
        reply.status(200).send({ status: 'success', data: output })
    });
}