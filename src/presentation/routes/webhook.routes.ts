import type { FastifyInstance } from "fastify";
import { WebhookController } from "../controllers/webhook.controller.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeMerchant } from "../middlewares/authorize.middleware.js";

const controller = new WebhookController();

const webhookData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: '4800d1f7-3006-419e-b376-4741de2c5452' },
        merchantId: { type: 'string', format: 'uuid', example: '936585a5-3482-4868-8477-e819f4d4317e' },
        url: {
            type: 'string',
            description: 'URL that will receive webhook POST requests.',
            example: 'https://meu-sistema.com/webhooks/payflow'
        },
        events: {
            type: 'array',
            items: {
                type: 'string',
                enum: Object.values(WEBHOOK_EVENTS)
            },
            example: ['transaction.approved', 'transaction.failed']
        },
        isActive: {
            type: 'boolean',
            description: 'Inactive webhooks do not receive events.',
            example: true
        },
        createdAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2026-04-02T17:46:36.457Z' }
    },
    required: ['id', 'merchantId', 'url', 'events', 'isActive', 'createdAt', 'updatedAt']
}

const unauthorizedResponse = {
    description: 'Missing token or non-merchant token used',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Only merchants can access this resource' }
    }
}

export async function webhookRoutes(app: FastifyInstance): Promise<void>{
    app.post('/webhooks', {
        config: {
            rateLimit: { max: 10, timeWindow: '1 hour' }
        },

        schema: {
            tags: ['Webhook Routes'],
            summary: 'Register webhook',
            description: `Registers a webhook URL to receive event notifications. Each registered webhook receives a unique HMAC secret used to sign all payloads.Verify the signature on your end using the X-PayFlow-Signature header.\n\nAvailable events:\n- \`transaction.approved\` — transaction was approved and funds were moved\n- \`transaction.failed\` — transaction was denied by the authorizer\n- \`transaction.refunded\` — transaction was refunded\n- \`deposit.completed\` — deposit was completed and wallet credited\n- \`payment_link.used\` — payment link was paid by a customer`,

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    url: {
                        type: 'string',
                        description: 'HTTPS URL that will receive POST requests for the selected events.',
                        example: 'https://meu-sistema.com/webhooks/payflow'
                    },
                    events: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: Object.values(WEBHOOK_EVENTS)
                        },
                        minItems: 1,
                        description: 'List of events to subscribe to.',
                        example: ['transaction.approved', 'transaction.failed']
                    }
                },
                required: ['url', 'events']
            },

            response: {
                201: {
                    description: 'Webhook registered successfully. Store the secret securely. It is not returned again.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: webhookData
                    },
                    required: ['status', 'data']
                },

                400: {
                    description: 'Invalid URL or no events specified',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'VALIDATION_ERROR' },
                        message: { type: 'string', example: 'Invalid URL' }
                    }
                },

                401: unauthorizedResponse
            }
        },
        preHandler: [authenticate, authorizeMerchant]
    }, controller.register.bind(controller));

    app.get('/webhooks', {
        schema: {
            tags: ['Webhook Routes'],
            summary: 'List my webhooks',
            description: 'Returns all webhooks registered by the authenticated merchant, including inactive ones.',

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Webhooks retrieved successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: { type: 'array', items: webhookData }
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedResponse
            }
        },
        preHandler: [authenticate, authorizeMerchant]
    }, controller.list.bind(controller));

    app.patch('/webhooks/:id/deactivate', {
        schema: {
            tags: ['Webhook Routes'],
            summary: 'Deactivate webhook',
            description: 'Deactivates a webhook. Inactive webhooks stop receiving events but are not deleted — their delivery history is preserved. Merchants can only deactivate their own webhooks.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the webhook to deactivate',
                        example: '4800d1f7-3006-419e-b376-4741de2c5452'
                    }
                },
                required: ['id']
            },

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Webhook deactivated successfully. isActive is now false',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: webhookData
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedResponse,
                404: {
                    description: 'Webhook not found',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Webhook not found' }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeMerchant]
    }, controller.deactivate.bind(controller))
}