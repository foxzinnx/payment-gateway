import type { FastifyInstance } from "fastify";
import { WalletController } from "../controllers/wallet.controller.js";

const controller = new WalletController();

export async function walletRoutes(app: FastifyInstance): Promise<void> {
    app.post('/wallets', controller.create.bind(controller));
    app.get('/wallets/owner/:ownerId', controller.getByOwnerId.bind(controller));
    app.patch('/wallets/:id/credit', controller.credit.bind(controller));
    app.patch('/wallets/:id/debit', controller.debit.bind(controller));
}