import type { FastifyInstance } from "fastify";
import { PaymentLinkController } from "../controllers/payment-link.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeMerchant } from "../middlewares/authorize.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";

const controller = new PaymentLinkController();

// ─── Shared response schemas ──────────────────────────────────────────────────

const paymentLinkData = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            example: '4800d1f7-3006-419e-b376-4741de2c5452'
        },
        code: {
            type: 'string',
            description: 'Unique alphanumeric code in the format PAY-XXXXXX. Used by customers to identify and pay the link.',
            example: 'PAY-ABC123'
        },
        merchantId: {
            type: 'string',
            format: 'uuid',
            example: '936585a5-3482-4868-8477-e819f4d4317e'
        },
        amountInCents: {
            type: 'integer',
            description: 'Amount in cents (e.g., 5000 = R$50.00).',
            example: 5000
        },
        amountFormatted: {
            type: 'string',
            description: 'Human-readable amount with two decimal places.',
            example: '50.00'
        },
        currency: {
            type: 'string',
            enum: ['BRL', 'USD', 'EUR'],
            example: 'BRL'
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'Produto X'
        },
        status: {
            type: 'string',
            enum: ['ACTIVE', 'USED', 'EXPIRED'],
            description: 'ACTIVE: link is valid and can be paid. USED: link was already paid and cannot be reused. EXPIRED: link passed its 24-hour expiration window.',
            example: 'ACTIVE'
        },
        expiresAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the link expires. Links are valid for 24 hours after creation.',
            example: '2026-04-03T17:46:36.457Z'
        },
        usedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Timestamp when the link was paid. Null if not yet used.',
            example: null
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-04-02T17:46:36.457Z'
        }
    },
    required: ['id', 'code', 'merchantId', 'amountInCents', 'amountFormatted', 'currency', 'description', 'status', 'expiresAt', 'usedAt', 'createdAt']
}

const transactionData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: '4800d1f7-3006-419e-b376-4741de2c5452' },
        customerId: { type: 'string', format: 'uuid', example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5' },
        merchantId: { type: 'string', format: 'uuid', example: '936585a5-3482-4868-8477-e819f4d4317e' },
        amountInCents: {
            type: 'integer',
            description: 'Transaction amount in cents.',
            example: 5000
        },
        amountFormatted: {
            type: 'string',
            description: 'Human-readable amount with two decimal places.',
            example: '50.00'
        },
        currency: { type: 'string', enum: ['BRL', 'USD', 'EUR'], example: 'BRL' },
        status: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'FAILED'],
            description: 'APPROVED means funds were moved atomically. FAILED means the authorizer denied the transaction — no funds were moved and the payment link remains ACTIVE.',
            example: 'APPROVED'
        },
        description: {
            type: 'string',
            nullable: true,
            example: 'Produto X'
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

const unauthorizedMerchantResponse = {
    description: 'Missing token, non-merchant token, or attempting to access another merchant\'s resource',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Only merchants can access this resource' }
    }
}

const unauthorizedCustomerResponse = {
    description: 'Missing token or non-customer token used',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Only customers can access this resource' }
    }
}

const unauthorizedMissingTokenResponse = {
    description: 'Missing or invalid authorization token',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Missing authorization token' }
    }
}

const notFoundResponse = {
    description: 'Payment link not found',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'NOT_FOUND' },
        message: { type: 'string', example: 'Payment link not found' }
    }
}

const alreadyUsedResponse = {
    description: 'Payment link has already been used',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'PAYMENT_LINK_ALREADY_USED' },
        message: { type: 'string', example: 'This payment link has already been used' }
    }
}

const expiredResponse = {
    description: 'Payment link has expired (24-hour window exceeded)',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'PAYMENT_LINK_EXPIRED' },
        message: { type: 'string', example: 'This payment link has expired' }
    }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function paymentLinkRoutes(app: FastifyInstance): Promise<void> {

    app.post('/payment-links', {
        schema: {
            tags: ['Payment Link Routes'],
            summary: 'Create payment link',
            description: 'Creates a payment link that can be shared with a customer for payment. The link is identified by a unique code in the format PAY-XXXXXX. Links expire after 24 hours and can only be used once. Only active merchants can create payment links.',

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    amountInCents: {
                        type: 'integer',
                        minimum: 100,
                        maximum: 1000000,
                        description: 'Amount to charge in cents. Minimum: 100 (R$1.00). Maximum: 1000000 (R$10,000.00).',
                        example: 5000
                    },
                    currency: {
                        type: 'string',
                        enum: ['BRL', 'USD', 'EUR'],
                        default: 'BRL',
                        example: 'BRL'
                    },
                    description: {
                        type: 'string',
                        maxLength: 255,
                        description: 'Optional description shown to the customer at payment confirmation.',
                        example: 'Produto X'
                    }
                },
                required: ['amountInCents']
            },

            response: {
                201: {
                    description: 'Payment link created successfully. Share the code field with the customer.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: paymentLinkData
                    },
                    required: ['status', 'data']
                },
                400: {
                    description: 'Inactive merchants cannot create payment links',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'INVALID_ARGUMENT' },
                        message: { type: 'string', example: 'Inactive merchants cannot create payment links' }
                    }
                },
                401: unauthorizedMerchantResponse,
                404: {
                    description: 'Merchant not found',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Merchant not found' }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeMerchant]
    }, controller.create.bind(controller));

    app.get('/payment-links/:code', {
        schema: {
            tags: ['Payment Link Routes'],
            summary: 'Get payment link details',
            description: 'Returns the details of a payment link by its code. Used by the customer app to display merchant name, amount and description before confirming the payment. Returns 409 if the link was already used, and 410 if it has expired.',

            params: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Payment link code in the format PAY-XXXXXX. Case-insensitive — normalized to uppercase internally.',
                        example: 'PAY-ABC123'
                    }
                },
                required: ['code']
            },

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Payment link details retrieved successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    example: 'PAY-ABC123'
                                },
                                merchantName: {
                                    type: 'string',
                                    description: 'Trade name (nome fantasia) of the merchant who created the link.',
                                    example: 'Loja Exemplo'
                                },
                                amountInCents: {
                                    type: 'integer',
                                    example: 5000
                                },
                                amountFormatted: {
                                    type: 'string',
                                    example: '50.00'
                                },
                                currency: {
                                    type: 'string',
                                    enum: ['BRL', 'USD', 'EUR'],
                                    example: 'BRL'
                                },
                                description: {
                                    type: 'string',
                                    nullable: true,
                                    example: 'Produto X'
                                },
                                expiresAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    description: 'Timestamp when the link expires.',
                                    example: '2026-04-03T17:46:36.457Z'
                                }
                            },
                            required: ['code', 'merchantName', 'amountInCents', 'amountFormatted', 'currency', 'description', 'expiresAt']
                        }
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedMissingTokenResponse,
                404: notFoundResponse,
                409: alreadyUsedResponse,
                410: expiredResponse
            }
        },
        preHandler: authenticate
    }, controller.getDetails.bind(controller));

    app.post('/payment-links/pay', {
        schema: {
            tags: ['Payment Link Routes'],
            summary: 'Pay via payment link',
            description: 'Processes a payment using a payment link code. Only customers can pay via links — merchant tokens return 401. The payment goes through the authorization service before being approved. If approved, the customer wallet is debited, the merchant wallet is credited, and the link is marked as USED — all atomically in a single database transaction. If the authorizer denies the payment, the transaction is saved as FAILED and the link remains ACTIVE. If an idempotencyKey is provided and already exists, the original result is returned without processing a new payment.',

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'Payment link code in the format PAY-XXXXXX. Case-insensitive.',
                        example: 'PAY-ABC123'
                    },
                    idempotencyKey: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Optional UUID to prevent duplicate payments. If a transaction with this key already exists, the original result is returned without processing a new payment.',
                        example: 'aacb8331-541b-4496-8c96-ce443f40c5d8'
                    }
                },
                required: ['code']
            },

            response: {
                201: {
                    description: 'Payment processed. Check the status field — APPROVED means funds were moved atomically, FAILED means the authorizer denied it (no funds moved, link remains ACTIVE).',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: transactionData
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedCustomerResponse,
                404: {
                    description: 'Payment link, customer, merchant, or wallet not found',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Payment link not found' }
                    }
                },
                409: alreadyUsedResponse,
                410: expiredResponse
            }
        },
        preHandler: [authenticate, authorizeCustomer]
    }, controller.pay.bind(controller));
}