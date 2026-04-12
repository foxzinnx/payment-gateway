import type { FastifyInstance } from "fastify";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorizeCustomer, authorizeMerchant } from "../middlewares/authorize.middleware.js";
import { PaymentLinkController } from "../controllers/payment-link.controller.js";

const controller = new PaymentLinkController();

export async function paymentLinkRoutes(app: FastifyInstance): Promise<void>{
    app.post('/payment-links', { preHandler: [authenticate, authorizeMerchant] }, controller.create.bind(controller));
    app.get('/payment-links/:code', { preHandler: [authenticate] }, controller.getDetails.bind(controller));
    app.post('/payment-links/pay', { preHandler: [authenticate, authorizeCustomer] }, controller.pay.bind(controller));
}