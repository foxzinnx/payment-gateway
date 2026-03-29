import type { FastifyInstance } from "fastify";
import { CustomerController } from "../controllers/customer.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer } from "../middlewares/authorize.middleware.js";

const controller = new CustomerController();

export async function customerRoutes(app: FastifyInstance): Promise<void>{
    app.get('/customers/:id',  { preHandler: authenticate }, controller.getById.bind(controller));
    app.patch('/customers/:id',  { preHandler: [authenticate, authorizeCustomer] }, controller.update.bind(controller));
}