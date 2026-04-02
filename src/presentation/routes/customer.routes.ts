import type { FastifyInstance } from "fastify";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";

const controller = new CustomerController();

export async function customerRoutes(app: FastifyInstance): Promise<void>{
    app.get('/customers/:id', {
        schema: {
            tags: ['Customer Routes'],
            summary: 'Get customer by id',
            description: 'Get customer by id',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Customer ID',
                        example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c'
                    }
                },
                required: ['id']
            },

            security: [
                { bearerAuth: [] }
            ],

            response: {
                200: {
                    description: 'Customer found successfully',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['success'],
                            example: 'success'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c'
                                },
                                name: {
                                    type: 'string',
                                    example: 'João Silva'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'joaosilva@gmail.com'
                                },
                                cpf: {
                                    type: 'string',
                                    example: '484.867.340-29'
                                },
                                phone: {
                                    type: 'string',
                                    example: '18995262362',
                                },
                                createdAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-03-30T18:34:03.926Z'
                                },
                                updatedAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-03-30T18:34:03.926Z'
                                }
                            },
                            required: ['id', 'name', 'email', 'cpf', 'phone', 'createdAt', 'updatedAt']
                        }
                    },
                    required: ['status', 'data']
                },

                404: {
                    description: 'Customer not found',
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
                            example: 'Customer not found'
                        }
                    }
                }
            }
        },
        preHandler: authenticate
     }, controller.getById.bind(controller));
    app.patch('/customers/:id',  {
        schema: {
            tags: ['Customer Routes'],
            summary: 'Update customer',
            description: 'Update specific customer fields such as email, name, and phone number.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Customer ID',
                        example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c' 
                    }
                },
                required: ['id']
            },

            security: [
                { bearerAuth: [] }
            ],

            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        example: 'New name'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'newemail@email.com'
                    },
                    phone: {
                        type: 'string',
                        example: '5429447112'
                    }
                },
            },

            response: {
                200: {
                    description: 'Customer updated successfully',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['success'],
                            example: 'success'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd0c05188-c5a9-4cc6-ab8e-6272b40e5f6c'
                                },
                                name: {
                                    type: 'string',
                                    example: 'New name'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'newemail@email.com'
                                },
                                cpf: {
                                    type: 'string',
                                    example: '484.867.340-29'
                                },
                                phone: {
                                    type: 'string',
                                    example: '5429447112',
                                },
                                createdAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-03-30T18:34:03.926Z'
                                },
                                updatedAt: {
                                    type: 'string',
                                    format: 'date',
                                    example: '2026-03-30T18:34:03.926Z'
                                }
                            },
                            required: ['id', 'name', 'email', 'cpf', 'phone', 'createdAt', 'updatedAt']
                        }
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'You can only update your own account',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'UNAUTHORIZED'
                        },
                        message: {
                            type: 'string',
                            example: 'You can only update your own account'
                        }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeCustomer]
     }, controller.update.bind(controller));
}