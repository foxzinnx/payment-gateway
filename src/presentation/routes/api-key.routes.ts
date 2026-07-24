import type { FastifyInstance } from "fastify";
import { ApiKeyController } from "../controllers/api-key.controller.js";

const controller = new ApiKeyController();

const apiKeyData = {
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'CapyFood Production' },
        keyPrefix: {
            type: 'string',
            description: 'Partial key for identification. Never exposes the full key.',
            example: 'payflow_live_abc1...'
        },
        isActive: { type: 'boolean', example: true },
        lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
        createdAt: { type: 'string', format: 'date-time' }
    }
}

export async function apiKeyRoutes(app: FastifyInstance): Promise<void>{
    app.post('/api-keys', {
        schema: {
            tags: ['API Key Routes'],
            summary: 'Create API key',
            description: 'Creates a new API key for external service integration. The rawKey is shown ONLY once — store it securely. Subsequent requests will only return the keyPrefix for identification.',
            
            body: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'Descriptive name for this key.',
                        example: 'CapyFood Production'
                    }
                },
                required: ['name']
            },

            response: {
                201: {
                    description: 'API key created. Store the rawKey, it will not be shown again.',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                name: { type: 'string', example: 'CapyFood Production' },
                                rawKey: {
                                    type: 'string',
                                    description: 'Full API key, shown only once. Store securely.',
                                    example: 'payflow_live_a1b2c3d4e5f6...'
                                },
                                keyPrefix: { type: 'string', example: 'payflow_live_a1b2...' },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            }
        }
    }, controller.createApiKey.bind(controller));

    app.get('/api-keys', {
        schema: {
            tags: ['API Key Routes'],
            summary: 'List API keys',
            description: 'Lists all API keys. Never returns the full key, only the prefix for identification.',
            
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: { type: 'array', items: apiKeyData }
                    }
                }
            }
        }
    }, controller.listApiKeys.bind(controller));

    app.patch('/api-keys/:id/revoke', {
        schema: {
            tags: ['API Key Routes'],
            summary: 'Revoke API key',
            description: 'Revokes an API key. The key stops working immediately. This action cannot be undone.',

            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            },

            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: apiKeyData
                    }
                }
            }
        }
    }, controller.revokeApiKey.bind(controller));
}