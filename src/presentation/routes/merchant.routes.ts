import type { FastifyInstance } from "fastify";
import { MerchantController } from "../controllers/merchant.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeMerchant } from "../middlewares/authorize.middleware.js";

const controller = new MerchantController();

export async function merchantRoutes(app: FastifyInstance): Promise<void> {
    app.get('/merchants/:id',  { preHandler: authenticate }, controller.getById.bind(controller));
    app.patch('/merchants/:id',  { preHandler: [authenticate, authorizeMerchant] }, controller.update.bind(controller));
    app.patch('/merchants/:id/suspend', { preHandler: [authenticate, authorizeMerchant] }, controller.suspend.bind(controller));
}