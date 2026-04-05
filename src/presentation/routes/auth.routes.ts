import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

const controller = new AuthController();

const authDataResponse = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: 'Short-lived JWT access token. Expires according to JWT_ACCESS_EXPIRES_IN env var (default: 15m).',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        refreshToken: {
            type: 'string',
            description: 'Long-lived JWT refresh token. Expires according to JWT_REFRESH_EXPIRES_IN env var (default: 7d).',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    format: 'uuid',
                    example: '7624ca42-1752-4eff-bd75-371212dee0c0'
                },
                name: {
                    type: 'string',
                    example: 'João Silva'
                },
                email: {
                    type: 'string',
                    format: 'email',
                    example: 'joaocliente@email.com'
                }
            },
            required: ['id', 'name', 'email']
        }
    },
    required: ['accessToken', 'refreshToken', 'user']
}

const invalidArgumentResponse = {
    description: 'Email or document (CPF/CNPJ) already in use',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'], example: 'error' },
        code: { type: 'string', example: 'INVALID_ARGUMENT' },
        message: { type: 'string', example: 'Email already in use' }
    }
}

const validationErrorResponse = {
    description: 'Request body failed schema validation',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'], example: 'error' },
        code: { type: 'string', example: 'VALIDATION_ERROR' },
        message: { type: 'string', example: 'Validation failed' },
        issues: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    field: { type: 'string', example: 'email' },
                    message: { type: 'string', example: 'Invalid email' }
                }
            }
        }
    }
}

const unauthorizedResponse = {
    description: 'Invalid credentials or expired/invalid refresh token',
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['error'], example: 'error' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
        message: { type: 'string', example: 'Invalid credentials' }
    }
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
    app.post('/auth/customer/register', {
        schema: {
            tags: ['Customer Auth Routes'],
            summary: 'Register a customer',
            description: 'Creates a new customer account and returns JWT access and refresh tokens. Both email and CPF must be unique across all customers.',

            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 100,
                        description: 'Full name of the customer.',
                        example: 'João Silva'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Unique email address. Will be normalized to lowercase.',
                        example: 'joaocliente@email.com'
                    },
                    cpf: {
                        type: 'string',
                        minLength: 11,
                        maxLength: 14,
                        description: 'Brazilian CPF. Accepts formatted (000.000.000-00) or digits only.',
                        example: '484.867.340-29'
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        maxLength: 100,
                        description: 'Password with at least 6 characters. Stored as bcrypt hash.',
                        example: 'senha123'
                    },
                    phone: {
                        type: 'string',
                        description: 'Optional phone number.',
                        example: '18995262362'
                    }
                },
                required: ['name', 'email', 'cpf', 'password'],
                additionalProperties: false
            },

            response: {
                201: {
                    description: 'Customer registered successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: authDataResponse
                    },
                    required: ['status', 'data']
                },
                400: validationErrorResponse,
                409: invalidArgumentResponse
            }
        }
    }, controller.registerCustomer.bind(controller));

    app.post('/auth/customer/login', {
        schema: {
            tags: ['Customer Auth Routes'],
            summary: 'Authenticate customer',
            description: 'Authenticates a customer with email and password. Returns new access and refresh tokens, rotating the previous refresh token.',

            body: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'joaocliente@email.com'
                    },
                    password: {
                        type: 'string',
                        example: 'senha123'
                    }
                },
                required: ['email', 'password'],
                additionalProperties: false
            },

            response: {
                200: {
                    description: 'Customer authenticated successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: authDataResponse
                    },
                    required: ['status', 'data']
                },
                400: validationErrorResponse,
                401: unauthorizedResponse
            }
        }
    }, controller.loginCustomer.bind(controller));

    app.post('/auth/customer/refresh', {
        schema: {
            tags: ['Customer Auth Routes'],
            summary: 'Refresh customer tokens',
            description: 'Generates a new access token and rotates the refresh token. The previous refresh token is invalidated after use — each token can only be used once.',

            body: {
                type: 'object',
                properties: {
                    refreshToken: {
                        type: 'string',
                        description: 'A valid, non-expired, and previously unused refresh token.',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                },
                required: ['refreshToken'],
                additionalProperties: false
            },

            response: {
                200: {
                    description: 'Tokens refreshed successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                            },
                            required: ['accessToken', 'refreshToken']
                        }
                    },
                    required: ['status', 'data']
                },
                401: {
                    description: 'Refresh token is invalid, expired, or has already been used',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['error'], example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Invalid refresh token' }
                    }
                }
            }
        }
    }, controller.refreshCustomer.bind(controller));

    app.post('/auth/merchant/register', {
        schema: {
            tags: ['Merchant Auth Routes'],
            summary: 'Register a merchant',
            description: 'Creates a new merchant account and returns JWT access and refresh tokens. Both email and CNPJ must be unique. Merchant status starts as ACTIVE.',

            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 150,
                        description: 'Legal business name (razão social).',
                        example: 'Loja Exemplo LTDA'
                    },
                    tradeName: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 150,
                        description: 'Trade name (nome fantasia).',
                        example: 'Loja Exemplo'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Unique business email address.',
                        example: 'contato@lojaempresa.com'
                    },
                    cnpj: {
                        type: 'string',
                        minLength: 14,
                        maxLength: 18,
                        description: 'Brazilian CNPJ. Accepts formatted (00.000.000/0000-00) or digits only.',
                        example: '11.222.333/0001-81'
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        maxLength: 100,
                        description: 'Password with at least 6 characters. Stored as bcrypt hash.',
                        example: 'senhasecreta123'
                    }
                },
                required: ['name', 'tradeName', 'email', 'cnpj', 'password'],
                additionalProperties: false
            },

            response: {
                201: {
                    description: 'Merchant registered successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', format: 'uuid', example: '7624ca42-1752-4eff-bd75-371212dee0c0' },
                                        name: { type: 'string', example: 'Loja Exemplo LTDA' },
                                        email: { type: 'string', format: 'email', example: 'contato@lojaempresa.com' }
                                    },
                                    required: ['id', 'name', 'email']
                                }
                            },
                            required: ['accessToken', 'refreshToken', 'user']
                        }
                    },
                    required: ['status', 'data']
                },
                400: validationErrorResponse,
                409: invalidArgumentResponse
            }
        }
    }, controller.registerMerchant.bind(controller));

    app.post('/auth/merchant/login', {
        schema: {
            tags: ['Merchant Auth Routes'],
            summary: 'Authenticate merchant',
            description: 'Authenticates a merchant with email and password. Returns new access and refresh tokens, rotating the previous refresh token.',

            body: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'contato@lojaempresa.com'
                    },
                    password: {
                        type: 'string',
                        example: 'senhaforte123'
                    }
                },
                required: ['email', 'password'],
                additionalProperties: false
            },

            response: {
                200: {
                    description: 'Merchant authenticated successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                user: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', format: 'uuid', example: '7624ca42-1752-4eff-bd75-371212dee0c0' },
                                        name: { type: 'string', example: 'Loja Exemplo LTDA' },
                                        email: { type: 'string', format: 'email', example: 'contato@lojaempresa.com' }
                                    },
                                    required: ['id', 'name', 'email']
                                }
                            },
                            required: ['accessToken', 'refreshToken', 'user']
                        }
                    },
                    required: ['status', 'data']
                },
                400: validationErrorResponse,
                401: unauthorizedResponse
            }
        }
    }, controller.loginMerchant.bind(controller));

    app.post('/auth/merchant/refresh', {
        schema: {
            tags: ['Merchant Auth Routes'],
            summary: 'Refresh merchant tokens',
            description: 'Generates a new access token and rotates the refresh token. The previous refresh token is invalidated after use — each token can only be used once.',

            body: {
                type: 'object',
                properties: {
                    refreshToken: {
                        type: 'string',
                        description: 'A valid, non-expired, and previously unused refresh token.',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                },
                required: ['refreshToken'],
                additionalProperties: false
            },

            response: {
                200: {
                    description: 'Tokens refreshed successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['success'], example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                            },
                            required: ['accessToken', 'refreshToken']
                        }
                    },
                    required: ['status', 'data']
                },
                401: {
                    description: 'Refresh token is invalid, expired, or has already been used',
                    type: 'object',
                    properties: {
                        status: { type: 'string', enum: ['error'], example: 'error' },
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Invalid refresh token' }
                    }
                }
            }
        }
    }, controller.refreshMerchant.bind(controller));
}