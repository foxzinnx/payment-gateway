import type { FastifyInstance } from "fastify";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";

const controller = new CustomerController();

const customerData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid', example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c' },
        name: { type: 'string', example: 'João Silva' },
        email: { type: 'string', format: 'email', example: 'joaosilva@gmail.com' },
        cpf: { type: 'string', example: '484.867.340-29' },
        phone: { type: 'string', nullable: true, example: '18995262362' },
        createdAt: { type: 'string', format: 'date-time', example: '2026-03-30T18:34:03.926Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2026-03-30T18:34:03.926Z' }
    },
    required: ['id', 'name', 'email', 'cpf', 'createdAt', 'updatedAt']
}

const notFoundResponse = {
    description: 'Customer not found',
    type: 'object',
    properties: {
        status: { type: 'string', example: 'error' },
        code: { type: 'string', example: 'NOT_FOUND' },
        message: { type: 'string', example: 'Customer not found' }
    }
}

export async function customerRoutes(app: FastifyInstance): Promise<void> {
    app.get('/customers/me', {
        schema: {
            tags: ['Customer Routes'],
            summary: 'Get My Profile',
            description: 'Returns the authenticated customer own profile data. The customer is identified by the JWT token. No parameters needed. Only customers can access this route.',

            security: [{ bearerAuth: [] }],

            response: {
                200: {
                    description: 'Customer profile retrieved successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: customerData
                    },
                    required: ['status', 'data']
                },
                401: {
                    description: 'Missing token or non-customer token used',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Only customers can access this resource' }
                    }
                },
                404: notFoundResponse
            }
        },
        preHandler: [authenticate, authorizeCustomer]
    }, controller.getMyProfile.bind(controller));

    app.patch('/customers/:id', {
        schema: {
            tags: ['Customer Routes'],
            summary: 'Update customer',
            description: 'Updates one or more customer fields (name, email, phone). Only the authenticated customer can update their own account — updating another customer\'s data returns 401. If a new email is provided, it must not be in use by another customer.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'UUID of the customer to update. Must match the authenticated user\'s ID.',
                        example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c'
                    }
                },
                required: ['id']
            },

            security: [{ bearerAuth: [] }],

            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 100,
                        description: 'New full name.',
                        example: 'João Silva Atualizado'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'New email. Must be unique across all customers.',
                        example: 'novoemail@email.com'
                    },
                    phone: {
                        type: 'string',
                        nullable: true,
                        description: 'New phone number. Send null to remove.',
                        example: '5429447112'
                    }
                }
            },

            response: {
                200: {
                    description: 'Customer updated successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: customerData
                    },
                    required: ['status', 'data']
                },
                401: {
                    description: 'Missing token or attempting to update another customer\'s account',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'You can only update your own account' }
                    }
                },
                404: notFoundResponse,
                409: {
                    description: 'New email is already in use by another customer',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        code: { type: 'string', example: 'INVALID_ARGUMENT' },
                        message: { type: 'string', example: 'Email already in use' }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeCustomer]
    }, controller.update.bind(controller));
}