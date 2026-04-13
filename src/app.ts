import fastify from "fastify";
import { customerRoutes } from "./presentation/routes/customer.routes.js";
import { merchantRoutes } from "./presentation/routes/merchant.routes.js";
import { walletRoutes } from "./presentation/routes/wallet.routes.js";
import { errorHandler } from "./presentation/middlewares/error-handler.middleware.js";
import { authRoutes } from "./presentation/routes/auth.routes.js";
import { transactionRoutes } from "./presentation/routes/transaction.routes.js";
import swagger from "@fastify/swagger";
import scalarApiReference from "@scalar/fastify-api-reference"; 
import { paymentLinkRoutes } from "./presentation/routes/payment-link.routes.js";

export function buildApp(){
    const app = fastify({ 
        logger: true,
        ajv: {
            customOptions: {
                strict: false,
            }
        }
    });

    app.register(swagger, {
        openapi: {
            openapi: "3.0.3",
            info: {
                title: "Payment Gateway API",
                description: "API de gateway de pagamentos com clientes, merchants, wallets e transações",
                version: "1.0.0",
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                        description: 'Insert the JWT Token with the format: Bearer <your-token>'
                    }
                }
            },
            servers: [
                {
                    url: `http://localhost:${process.env.PORT || 3333}`,
                    description: "Servidor de Desenvolvimento",
                },
            ],
        },
    });

    app.register(scalarApiReference, {
        routePrefix: "/docs",
        configuration: {
            title: "Payment Gateway API",
            theme: "default",
            darkMode: true,
            content: () => app.swagger(),
        },
    });

    app.register(authRoutes, { prefix: '/api/v1' });
    app.register(customerRoutes, { prefix: '/api/v1' });
    app.register(merchantRoutes, { prefix: '/api/v1' });
    app.register(walletRoutes, { prefix: '/api/v1' });
    app.register(transactionRoutes, { prefix: '/api/v1' })
    app.register(paymentLinkRoutes, { prefix: '/api/v1' });

    app.get('/health', async () => ({ status: 'ok' }));

    app.setErrorHandler(errorHandler);

    return app;
}