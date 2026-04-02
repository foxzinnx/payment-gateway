import type { FastifyInstance } from "fastify";
import { MerchantController } from "../controllers/merchant.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeMerchant } from "../middlewares/authorize.middleware.js";

const controller = new MerchantController();

export async function merchantRoutes(app: FastifyInstance): Promise<void> {
    app.get('/merchants/:id',  { 
        schema: {
            tags: ['Merchant Routes'],
            summary: 'Get merchant by id',
            description: 'Get for a merchant by ID.',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Merchant ID',
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
                    description: 'Merchant found successfully',
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
                                    example: 'Loja Exemplo LTDA'
                                },
                                tradeName: {
                                    type: 'string',
                                    example: 'Loja Exemplo'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'contato@lojaexemplo.com'
                                },
                                cnpj: {
                                    type: 'string',
                                    example: '11.222.333/0001-81'
                                },
                                status: {
                                    type: 'string',
                                    example: 'ACTIVE',
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
                            required: ['id', 'name', 'tradeName', 'email', 'cnpj', 'status', 'createdAt', 'updatedAt']
                        }
                    },
                    required: ['status', 'data']
                },

                404: {
                    description: 'Merchant not found',
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
                            example: 'Merchant not found'
                        }
                    }
                }
            }
        },
        preHandler: authenticate
     }, controller.getById.bind(controller));
    app.patch('/merchants/:id',  { 
        schema: {
            tags: ['Merchant Routes'],
            summary: 'Update merchant',
            description: 'Update specific merchant fields',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Merchant ID',
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
                    tradeName: {
                        type: 'string',
                        example: 'New trade name'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'newemail@lojaempresa.com'
                    }
                }
            },

            response: {
                200: {
                    description: 'Merchant found successfully',
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
                                    example: 'Loja Exemplo LTDA'
                                },
                                tradeName: {
                                    type: 'string',
                                    example: 'New trade name'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'newemail@lojaexemplo.com'
                                },
                                cnpj: {
                                    type: 'string',
                                    example: '11.222.333/0001-81'
                                },
                                status: {
                                    type: 'string',
                                    example: 'ACTIVE',
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
                            required: ['id', 'name', 'tradeName', 'email', 'cnpj', 'status', 'createdAt', 'updatedAt']
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
        preHandler: [authenticate, authorizeMerchant]
     }, controller.update.bind(controller));
    app.patch('/merchants/:id/suspend', {
        schema: {
            tags: ['Merchant Routes'],
            summary: 'Suspend merchant',
            description: 'Suspend merchant account',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Merchant ID',
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
                    description: 'Merchant suspended successfully',
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
                                    example: 'Loja Exemplo LTDA'
                                },
                                tradeName: {
                                    type: 'string',
                                    example: 'New trade name'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email',
                                    example: 'newemail@lojaexemplo.com'
                                },
                                cnpj: {
                                    type: 'string',
                                    example: '11.222.333/0001-81'
                                },
                                status: {
                                    type: 'string',
                                    example: 'SUSPENDED',
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
                            required: ['id', 'name', 'tradeName', 'email', 'cnpj', 'status', 'createdAt', 'updatedAt']
                        }
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'You can only suspend your own account',
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
                            example: 'You can only suspend your own account'
                        }
                    }
                }
            }
        },
        preHandler: [authenticate, authorizeMerchant]
     }, controller.suspend.bind(controller));
}