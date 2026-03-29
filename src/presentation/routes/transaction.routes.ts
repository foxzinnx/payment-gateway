import type { FastifyInstance } from "fastify";
import { TransactionController } from "../controllers/transaction.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";

const controller = new TransactionController();

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
    app.post('/transactions', { preHandler: [authenticate, authorizeCustomer] } ,controller.create.bind(controller));
    app.get('/transactions/:id', { preHandler: authenticate }, controller.getById.bind(controller));
}