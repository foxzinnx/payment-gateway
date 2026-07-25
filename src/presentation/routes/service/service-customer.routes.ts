import { ServiceCustomerController } from "@/presentation/controllers/service/service-customer.controller.js";
import { authenticateApiKey } from "@/presentation/middlewares/authenticate-api-key.middleware.js";
import type { FastifyInstance } from "fastify";

const controller = new ServiceCustomerController();

export async function serviceCustomerRoutes(app: FastifyInstance): Promise<void>{
    app.post('/service/customers', {
        schema: {
            tags: ['Service Routes - Customer'],
            summary: 'Register customer (service)',
            description: 'Registers a customer in PayFlow on behalf of an external service. Requires API Key authentication via X-API-Key header. Creates the customer and their wallet automatically.',

            security: [{ apiKey: [] }],

            body: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'João Silva' },
                    email: { type: 'string', format: 'email', example: 'joao@capyfood.com' },
                    cpf: { type: 'string', example: '529.982.247-25' },
                    password: { type: 'string', example: 'minhasenha123' },
                    phone: { type: 'string', example: '11999999999' }
                },
                required: ['name', 'email', 'cpf', 'password']
            },

            response: {
                201: {
                    description: 'Customer registered and wallet created successfully',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        data: {
                            customerId: { type: 'string', format: 'uuid' },
                            walletId: { type: 'string', format: 'uuid' },
                            accessToken: { type: 'string' },
                            refreshToken: { type: 'string' }
                        }
                    }
                }
            }
        },
        preHandler: [authenticateApiKey]
    }, controller.register.bind(controller));

    app.get('/service/customers/:customerId/wallet', {
        schema: {
            tags: ['Service Routes - Customer'],
            summary: 'Get customer wallet (service)',
            description: 'Returns the wallet of a customer. Used by CapyFood to display balance.',
            security: [{ apiKey: [] }]
        },
        preHandler: [authenticateApiKey]
    }, controller.getWallet.bind(controller));
}