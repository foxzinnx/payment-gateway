import fastify from "fastify";
import { customerRoutes } from "./presentation/routes/customer.routes.js";
import { merchantRoutes } from "./presentation/routes/merchant.routes.js";
import { walletRoutes } from "./presentation/routes/wallet.routes.js";
import { errorHandler } from "./presentation/middlewares/error-handler.middleware.js";

export function buildApp(){
    const app = fastify({ logger: true });

    app.register(customerRoutes, { prefix: '/api/v1' });
    app.register(merchantRoutes, { prefix: '/api/v1' });
    app.register(walletRoutes, { prefix: '/api/v1' });

    app.get('/health', async () => ({ status: 'ok' }));

    app.setErrorHandler(errorHandler);

    return app;
}