import { ServiceMerchantController } from "@/presentation/controllers/service/service-merchant.controller.js";
import { authenticateApiKey } from "@/presentation/middlewares/authenticate-api-key.middleware.js";
import type { FastifyInstance } from "fastify";

const controller = new ServiceMerchantController();

export async function serviceMerchantRoutes(app: FastifyInstance): Promise<void>{
    app.post('/service/merchants', {
        schema: {
            tags: ['Service Routes - Merchant'],
            summary: 'Register merchant (service)',
            description: 'Registers a restaurant owner as a merchant in PayFlow. Creates the merchant and their wallet automatically.',
            security: [{ apiKey: [] }]
        },
        preHandler: [authenticateApiKey]
    }, controller.register.bind(controller))
}