import type { FastifyInstance } from "fastify";
import { WalletController } from "../controllers/wallet.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const controller = new WalletController();

export async function walletRoutes(app: FastifyInstance): Promise<void> {
    app.post('/wallets', { 
        schema: {
            tags: ['Wallet Routes'],
            summary: 'Create wallet',
            description: 'Create a wallet',

            security: [
                { bearerAuth: [] }
            ],

            body: {
                type: 'object',
                properties: {
                    ownerId: {
                        type: 'string',
                        format: 'uuid',
                        example: 'aacb8331-541b-4496-8c96-ce443f40c5d8'
                    },
                    ownerType: {
                        type: 'string',
                        enum: ['CUSTOMER', 'MERCHANT'],
                        example: 'CUSTOMER'
                    },
                    currency: {
                        type: 'string',
                        enum: ['BRL', 'USD', 'EUR'],
                        example: 'BRL'
                    }
                },
                required: ['ownerId', 'ownerType']
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
                        data: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: '936585a5-3482-4868-8477-e819f4d4317e'
                                },
                                ownerId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                                },
                                ownerType: {
                                    type: 'string',
                                    enum: ['CUSTOMER', 'MERCHANT'],
                                    example: 'CUSTOMER'
                                },
                                balanceInCents: {
                                    type: 'number',
                                    example: 0
                                },
                                balanceFormatted: {
                                    type: 'string',
                                    example: '0.00'
                                },
                                currency: {
                                    type: 'string',
                                    enum: ['BRL', 'USD', 'EUR'],
                                    example: 'BRL'
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
    app.get('/wallets/owner/:ownerId', { 
        schema: {
            tags: ['Wallet Routes'],
            summary: 'Get Wallet By Id',
            description: 'Get for a wallet by id',

            params: {
                type: 'object',
                properties: {
                    ownerId: {
                        type: 'string',
                        format: 'uuid',
                        description: 'owner ID',
                        example: '936585a5-3482-4868-8477-e819f4d4317e'
                    }
                },
                required: ['ownerId']
            },

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
                        data: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: '936585a5-3482-4868-8477-e819f4d4317e'
                                },
                                ownerId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                                },
                                ownerType: {
                                    type: 'string',
                                    enum: ['CUSTOMER', 'MERCHANT'],
                                    example: 'CUSTOMER'
                                },
                                balanceInCents: {
                                    type: 'number',
                                    example: 0
                                },
                                balanceFormatted: {
                                    type: 'string',
                                    example: '0.00'
                                },
                                currency: {
                                    type: 'string',
                                    enum: ['BRL', 'USD', 'EUR'],
                                    example: 'BRL'
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
     } ,controller.getByOwnerId.bind(controller));
    app.patch('/wallets/:id/credit', { 
        schema: {
            tags: ['Wallet Routes'],
            summary: 'Credit wallet',
            description: 'Credit a wallet',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Wallet ID',
                        example: '936585a5-3482-4868-8477-e819f4d4317e'
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
                    amountInCents: {
                        type: 'number',
                        example: 2000
                    }
                },
                required: ['amountInCents']
            },

            response: {
                200: {
                    description: 'Credit wallet successfully',
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
                                    example: '936585a5-3482-4868-8477-e819f4d4317e'
                                },
                                ownerId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                                },
                                ownerType: {
                                    type: 'string',
                                    enum: ['CUSTOMER', 'MERCHANT'],
                                    example: 'CUSTOMER'
                                },
                                balanceInCents: {
                                    type: 'number',
                                    example: 2000
                                },
                                balanceFormatted: {
                                    type: 'string',
                                    example: '20.00'
                                },
                                currency: {
                                    type: 'string',
                                    enum: ['BRL', 'USD', 'EUR'],
                                    example: 'BRL'
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
     } ,controller.credit.bind(controller));
    app.patch('/wallets/:id/debit',  { 
        schema: {
            tags: ['Wallet Routes'],
            summary: 'Debit wallet',
            description: 'Debit a wallet',

            params: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        description: 'Wallet ID',
                        example: '936585a5-3482-4868-8477-e819f4d4317e'
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
                    amountInCents: {
                        type: 'number',
                        example: 2000
                    }
                },
                required: ['amountInCents']
            },

            response: {
                200: {
                    description: 'Debit wallet successfully',
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
                                    example: '936585a5-3482-4868-8477-e819f4d4317e'
                                },
                                ownerId: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: 'd3e676e3-f36f-4c8b-b567-bace05b09bd5'
                                },
                                ownerType: {
                                    type: 'string',
                                    enum: ['CUSTOMER', 'MERCHANT'],
                                    example: 'CUSTOMER'
                                },
                                balanceInCents: {
                                    type: 'number',
                                    example: 0
                                },
                                balanceFormatted: {
                                    type: 'string',
                                    example: '0.00'
                                },
                                currency: {
                                    type: 'string',
                                    enum: ['BRL', 'USD', 'EUR'],
                                    example: 'BRL'
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
                },

                422: {
                    description: 'Insufficient funds to complete this operation',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'INSUFFICIENT_FUNDS'
                        },
                        message: {
                            type: 'string',
                            example: 'Insufficient funds to complete this operation'
                        }
                    }
                }
            }
        },
        preHandler: authenticate
     }, controller.debit.bind(controller));
}