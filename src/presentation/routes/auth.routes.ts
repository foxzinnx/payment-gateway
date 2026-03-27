import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

const controller = new AuthController();

export async function authRoutes(app: FastifyInstance): Promise<void>{
    app.post('/auth/customer/register', controller.registerCustomer.bind(controller));
    app.post('/auth/customer/login', controller.loginCustomer.bind(controller));
    app.post('/auth/customer/refresh', controller.refreshCustomer.bind(controller));

    app.post('/auth/merchant/register', controller.registerMerchant.bind(controller));
    app.post('/auth/merchant/login', controller.loginMerchant.bind(controller));
    app.post('/auth/merchant/refresh', controller.loginMerchant.bind(controller));
}