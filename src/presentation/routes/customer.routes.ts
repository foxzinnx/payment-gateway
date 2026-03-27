import type { FastifyInstance } from "fastify";
import { CustomerController } from "../controllers/customer.controller.js";

const controller = new CustomerController();

export async function customerRoutes(app: FastifyInstance): Promise<void>{
    app.get('/customers/:id', controller.getById.bind(controller));
    app.patch('/customers/:id', controller.update.bind(controller));
}