import type { FastifyInstance } from "fastify";
import { MerchantController } from "../controllers/merchant.controller.js";

const controller = new MerchantController();

export async function merchantRoutes(app: FastifyInstance): Promise<void> {
    app.post('/merchants', controller.create.bind(controller));
    app.get('/merchants/:id', controller.getById.bind(controller));
    app.patch('/merchants/:id', controller.update.bind(controller));
    app.patch('/merchants/:id/suspend', controller.suspend.bind(controller));
}