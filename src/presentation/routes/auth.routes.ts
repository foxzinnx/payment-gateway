import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

const controller = new AuthController();

export async function authRoutes(app: FastifyInstance): Promise<void>{
    app.post('/auth/customer/register',{
        schema: {
            tags: ['Customer Auth Routes'],
            summary: 'Register a customer',
            description: 'Register a customer in system',

            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 100,
                        example: 'João Silva'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'joaocliente@email.com'
                    },
                    cpf: {
                        type: 'string',
                        minLength: 11,
                        maxLength: 14,
                        example: '48486734029'
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        maxLength: 100,
                        example: 'senha123'
                    },
                    phone: {
                        type: 'string',
                        example: '18995262362'
                    }
                },
                required: ['name', 'email', 'cpf', 'password'],
                additionalProperties: false
            },

            response: {
                201: {
                    description: 'Customer created with successfully',
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
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                refreshToken: {
                                    type: 'string',
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
                    },
                    required: ['status', 'data']
                },

                400: {
                    description: 'Email already in use',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error'],
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'EMAIL_ALREADY_IN_USE',
                        },
                        message: {
                            type: 'string',
                            example: 'Email already in use'
                        }
                    }
                }
            }
        }
    }, controller.registerCustomer.bind(controller));
    app.post('/auth/customer/login', {
        schema: {
            tags: ['Customer Auth Routes'],
            summary: 'Authenticate customer',
            description: 'Authenticates a customer and returns access and refresh tokens',

            body: {
                type: 'object',
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'joaosilva@gmail.com'
                    },
                    password: {
                        type: 'string',
                        example: 'senha123'
                    }
                },
                required: ['email', 'password']
            },

            response: {
                200: {
                    description: 'Customer authenticated with successfully',
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
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                refreshToken: {
                                    type: 'string',
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
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'Invalid credentials',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error'],
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'UNAUTHORIZED',
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid credentials'
                        }
                    }
                }
            }
        }
    }, controller.loginCustomer.bind(controller));
    app.post('/auth/customer/refresh', {
        schema: {
            tags: ['Customer Auth Routes'],
            summary: 'Refresh customer access token',
            description: 'Uses a valid refresh token to generate a new access token and a new refresh token',

            body: {
                type: 'object',
                properties: {
                    refreshToken: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                },
                required: ['refreshToken'],
                additionalProperties: false,
            },

            response: {
                200: {
                    description: 'Tokens refreshed successfully',
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
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                refreshToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                }
                            },
                            required: ['accessToken', 'refreshToken']
                        }
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'Invalid refresh token',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error'],
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'UNAUTHORIZED',
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid refresh token'
                        }
                    }
                }
            }
        }
    },controller.refreshCustomer.bind(controller));
    app.post('/auth/merchant/register', {
        schema: {
            tags: ['Merchant Auth Routes'],
            summary: 'Register a merchant',
            description: 'Register a merchant in system',

            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 150,
                        example: 'Loja exemplo LTDA'
                    },
                    tradeName: {
                        type: 'string',
                        minLength: 3,
                        maxLength: 150,
                        example: 'Loja exemplo'
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'contato@lojaempresa.com'
                    },
                    cnpj: {
                        type: 'string',
                        minLength: 14,
                        maxLength: 18,
                        example: '69102553000151'
                    },
                    password: {
                        type: 'string',
                        minLength: 6,
                        maxLength: 100,
                        example: 'senhasecreta123'
                    }
                },
                required: ['name', 'tradeName', 'email', 'cnpj', 'password'],
                additionalProperties: false,
            },

            response: {
                201: {
                    description: 'Customer created with successfully',
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
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                refreshToken: {
                                    type: 'string',
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
                                            example: 'Loja exemplo LTDA'
                                        },
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            example: 'contato@lojaempresa.com'
                                        }
                                    },
                                    required: ['id', 'name', 'email']
                                }
                            },
                            required: ['accessToken', 'refreshToken', 'user']
                        }
                    },
                    required: ['status', 'data']
                },

                400: {
                    description: 'Email already in use',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error'],
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'EMAIL_ALREADY_IN_USE',
                        },
                        message: {
                            type: 'string',
                            example: 'Email already in use'
                        }
                    }
                }
            }
        }
    },controller.registerMerchant.bind(controller));
    app.post('/auth/merchant/login', {
        schema: {
            tags: ['Merchant Auth Routes'],
            summary: 'Authenticate a merchant',
            description: 'Authenticates a merchant and returns access and refresh tokens',

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
                required: ['email', 'password']
            },

            response: {
                200: {
                    description: 'Merchant authenticated with successfully',
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
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                refreshToken: {
                                    type: 'string',
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
                                            example: 'Loja exemplo LTDA'
                                        },
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            example: 'contato@lojaempresa.com'
                                        }
                                    },
                                    required: ['id', 'name', 'email']
                                }
                            },
                            required: ['accessToken', 'refreshToken', 'user']
                        }
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'Invalid credentials',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error'],
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'UNAUTHORIZED',
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid credentials'
                        }
                    }
                }
            }
        }
    },controller.loginMerchant.bind(controller));
    app.post('/auth/merchant/refresh', {
        schema: {
            tags: ['Merchant Auth Routes'],
            summary: 'Refresh merchant access token',
            description: 'Uses a valid refresh token to generate a new access token and a new refresh token',

            body: {
                type: 'object',
                properties: {
                    refreshToken: {
                        type: 'string',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    }
                },
                required: ['refreshToken'],
                additionalProperties: false,
            },

            response: {
                200: {
                    description: 'Tokens refreshed successfully',
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
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                refreshToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                }
                            },
                            required: ['accessToken', 'refreshToken']
                        }
                    },
                    required: ['status', 'data']
                },

                401: {
                    description: 'Invalid refresh token',
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['error'],
                            example: 'error'
                        },
                        code: {
                            type: 'string',
                            example: 'UNAUTHORIZED',
                        },
                        message: {
                            type: 'string',
                            example: 'Invalid refresh token'
                        }
                    }
                }
            }
        }
    },controller.refreshMerchant.bind(controller));
}