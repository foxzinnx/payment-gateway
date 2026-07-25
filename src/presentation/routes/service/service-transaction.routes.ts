import { ServiceTransactionController } from "@/presentation/controllers/service/service-transaction.controller.js";
import { authenticateApiKey } from "@/presentation/middlewares/authenticate-api-key.middleware.js";
import type { FastifyInstance } from "fastify";

const controller = new ServiceTransactionController();

export async function serviceTransactionRoutes(app: FastifyInstance): Promise<void>{
    app.post('/service/transactions', {
        schema: {
            tags: ['Service Routes - Transaction'],
            summary: 'Create transaction (service)',
            description: 'Creates a transaction on behalf of a customer. Used by CapyFood when a customer places an order. The customerId in the body identifies the payer. The metadata.orderId links the transaction to the CapyFood order.',
            security: [{ apiKey: [] }]
        },
        preHandler: [authenticateApiKey]
    }, controller.create.bind(controller));

    app.post('/service/transactions/:transactionId/refund', {
        schema: {
            tags: ['Service Routes - Transaction'],
            summary: 'Refund transaction (service)',
            description: 'Refunds a transaction on behalf of a merchant. Used by CapyFood when a restaurant cancels an order.',
            security: [{ apiKey: [] }]
        },
        preHandler: [authenticateApiKey]
    }, controller.refund.bind(controller));

    app.get('/service/transactions/:transactionId', {
        schema: {
            tags: ['Service Routes - Transaction'],
            summary: 'Get transaction (service)',
            description: 'Returns transaction details including status and metadata. Used by CapyFood to check payment status.',
            security: [{ apiKey: [] }]
        },
        preHandler: [authenticateApiKey]
    }, controller.getById.bind(controller));
}