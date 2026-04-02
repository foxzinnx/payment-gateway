import type { FastifyInstance } from "fastify";
import { TransactionController } from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";

const controller = new TransactionController();

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
    app.post('/transactions', { 
        schema: {
            tags: ['Transaction Routes'],
            summary: 'Create Transaction',
            description: 'Create a transaction [CustomerOnly]',

            security: [
                { bearerAuth: [] }
            ],

            body: {
                type: 'object',
                properties: {
                    merchantId: {
                        type: 'string',
                        format: 'uuid',
                        example: '936585a5-3482-4868-8477-e819f4d4317e'
                    },
                    amountInCents: {
                        type: 'number',
                        example: 2000
                    },
                    currency: {
                        type: 'string',
                        enum: ['BRL', 'EUR', 'USD'],
                        example: 'BRL'
                    },
                    description: {
                        type: 'string',
                        example: 'Esse é seu pagamento que prometi'
                    },
                    idempotencyKey: {
                        type: 'string',
                        format: 'uuid',
                        example: 'aacb8331-541b-4496-8c96-ce443f40c5d8'
                    }
                },
                required: ['merchantId', 'amountInCents', 'currency']
            },

            response: {
                201: {
                    description: 'Transaction created successfully',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: '4800d1f7-3006-419e-b376-4741de2c5452'
                                },
                                customerId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                                },
                                merchantId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: '936585a5-3482-4868-8477-e819f4d4317e',
                                },
                                amountInCents: {
                                    type: 'number',
                                    example: 2000
                                },
                                amountFormatted: {
                                    type: 'string',
                                    example: '20.00'
                                },
                                currency: {
                                    type: 'string',
                                    enum: ['BRL', 'USD', 'EUR'],
                                    example: 'BRL'
                                },
                                status: {
                                    type: 'string',
                                    example: 'APPROVED'
                                },
                                description: {
                                    type: 'string',
                                    example: 'Esse é seu pagamento que prometi'
                                },
                                denialReason: {
                                    type: 'string',
                                    example: null
                                },
                                createdAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-04-02T17:46:36.457Z'
                                },
                                updatedAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-04-02T17:46:36.457Z'
                                }
                            },
                            required: ['id', 'ownerId', 'ownerType', 'balanceInCents', 'balanceFormatted', 'currency', 'createdAt', 'updatedAt']
                        }
                    },
                    required: ['status', 'data']
                },
            }
        },
        preHandler: [authenticate, authorizeCustomer]
     } ,controller.create.bind(controller));
    app.get('/transactions/:id', { 
        schema: {
            tags: ['Transaction Routes'],
            summary: 'Get Transaction By Id',
            description: 'Get for a transaction by id',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '936585a5-3482-4868-8477-e819f4d4317e'
                    }
                },
                required: ['id']
            },

            security: [
                { bearerAuth: [] }
            ],
            
            response: {
                200: {
                    description: 'Transaction found successfully',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: '4800d1f7-3006-419e-b376-4741de2c5452'
                                },
                                customerId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                                },
                                merchantId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: '936585a5-3482-4868-8477-e819f4d4317e',
                                },
                                amountInCents: {
                                    type: 'number',
                                    example: 2000
                                },
                                amountFormatted: {
                                    type: 'string',
                                    example: '20.00'
                                },
                                currency: {
                                    type: 'string',
                                    enum: ['BRL', 'USD', 'EUR'],
                                    example: 'BRL'
                                },
                                status: {
                                    type: 'string',
                                    example: 'APPROVED'
                                },
                                description: {
                                    type: 'string',
                                    example: 'Esse é seu pagamento que prometi'
                                },
                                denialReason: {
                                    type: 'string',
                                    example: null
                                },
                                createdAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-04-02T17:46:36.457Z'
                                },
                                updatedAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-04-02T17:46:36.457Z'
                                }
                            },
                            required: ['id', 'ownerId', 'ownerType', 'balanceInCents', 'balanceFormatted', 'currency', 'createdAt', 'updatedAt']
                        }
                    },
                    required: ['status', 'data']
                },

                404: {
                    description: 'Transaction not found',
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
                            example: 'Transaction not found'
                        }
                    }
                },
            }
        },
        preHandler: authenticate
     }, controller.getById.bind(controller));
}