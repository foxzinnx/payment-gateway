import type { FastifyInstance } from "fastify";
import { MerchantController } from "../controllers/merchant.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeMerchant } from "../middlewares/authorize.middleware.js";

const controller = new MerchantController();

const merchantData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c' },
        name: { type: 'string', example: 'Loja Exemplo LTDA' },
        tradeName: { type: 'string', example: 'Loja Exemplo' },
        email: { type: 'string', format: 'email', example: 'contato@lojaexemplo.com' },
        cnpj: { type: 'string', example: '11.222.333/0001-81' },
        status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
            example: 'ACTIVE'
        },
        createdAt: { type: 'string', format: 'date-time', example: '2026-03-30T18:34:03.926Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2026-03-30T18:34:03.926Z' }
    },
    required: ['id', 'name', 'tradeName', 'email', 'cnpj', 'status', 'createdAt', 'updatedAt']
}

const notFoundResponse = {
    description: 'Merchant not found',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'NOT_FOUND' },
        message: { type: 'string', example: 'Merchant not found' }
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

export async function merchantRoutes(app: FastifyInstance): Promise<void> {

    app.get('/merchants/:id', {
        schema: {
            tags: ['Merchant Routes'],
            summary: 'Get merchant by ID',
            description: 'Returns a merchant\'s public profile data by ID. Any authenticated user can view merchant profiles. Sensitive data such as password and refresh token are never exposed.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the merchant to retrieve.',
                        example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c'
                    }
                },
                required: ['id']
            },

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Merchant found successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: merchantData
                    },
                    required: ['status', 'data']
                },
                401: unauthorizedMissingTokenResponse,
                404: notFoundResponse
            }
        },
        preHandler: authenticate
    }, controller.getById.bind(controller));

    app.patch('/merchants/:id', {
        schema: {
            tags: ['Merchant Routes'],
            summary: 'Update merchant',
            description: 'Updates one or more merchant fields (tradeName, email). Only the authenticated merchant can update their own account. If a new email is provided, it must not be in use by another merchant.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the merchant to update. Must match the authenticated merchant\'s ID.',
                        example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c'
                    }
                },
                required: ['id']
            },

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    tradeName: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 150,
                        description: 'New trade name (nome fantasia).',
                        example: 'Novo Nome Fantasia'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'New email address. Must be unique across all merchants.',
                        example: 'novoemail@lojaexemplo.com'
                    }
                }
            },

            response: {
                200: {
                    description: 'Merchant updated successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: merchantData
                    },
                    required: ['status', 'data']
                },
                401: {
                    description: 'Missing token or attempting to update another merchant\'s account',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'You can only update your own account' }
                    }
                },
                404: notFoundResponse,
                409: {
                    description: 'New email is already in use by another merchant',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'INVALID_ARGUMENT' },
                        message: { type: 'string', example: 'Email already in use' }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeMerchant]
    }, controller.update.bind(controller));

    app.patch('/merchants/:id/suspend', {
        schema: {
            tags: ['Merchant Routes'],
            summary: 'Suspend merchant account',
            description: 'Suspends the authenticated merchant\'s own account. Only the merchant themselves can suspend their account — a customer token returns 401. Cannot suspend an already INACTIVE account.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the merchant to suspend. Must match the authenticated merchant\'s ID.',
                        example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c'
                    }
                },
                required: ['id']
            },

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Merchant suspended successfully. Status is now SUSPENDED.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            ...merchantData,
                            properties: {
                                ...merchantData.properties,
                                status: {
                                    type: 'string',
                                    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
                                    example: 'SUSPENDED'
                                }
                            }
                        }
                    },
                    required: ['status', 'data']
                },
                400: {
                    description: 'Cannot suspend an inactive merchant',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'INVALID_ARGUMENT' },
                        message: { type: 'string', example: 'Cannot suspend an inactive merchant' }
                    }
                },
                401: {
                    description: 'Missing token, non-merchant token, or attempting to suspend another merchant\'s account',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'You can only suspend your own account' }
                    }
                },
                404: notFoundResponse
            }
        },
        preHandler: [authenticate, authorizeMerchant]
    }, controller.suspend.bind(controller));
}