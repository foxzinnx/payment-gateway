import type { FastifyInstance } from "fastify";
import { WalletController } from "../controllers/wallet.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";

const controller = new WalletController();

export async function walletRoutes(app: FastifyInstance): Promise<void> {
    app.post('/wallets', { preHandler: authenticate } ,controller.create.bind(controller));
    app.get('/wallets/owner/:ownerId', { preHandler: authenticate } ,controller.getByOwnerId.bind(controller));
    app.patch('/wallets/:id/credit', { preHandler: authenticate } ,controller.credit.bind(controller));
    app.patch('/wallets/:id/debit',  { preHandler: authenticate }, controller.debit.bind(controller));
}