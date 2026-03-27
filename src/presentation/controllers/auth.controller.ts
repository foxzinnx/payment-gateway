import type { FastifyReply, FastifyRequest } from "fastify";
import { loginSchema, refreshTokenSchema, registerCustomerSchema, registerMerchantSchema } from "../schemas/auth.schema.js";
import { container } from "@/infra/container/index.js";

export class AuthController {
    async registerCustomer(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = registerCustomerSchema.parse(request.body);
        const output = await container.registerCustomer.execute(body);
        reply.status(201).send({ status: 'success', data: output });
    }

    async loginCustomer(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = loginSchema.parse(request.body);
        const output = await container.loginCustomer.execute(body);
        reply.status(200).send({ status: 'success', data: output });
    }

    async refreshCustomer(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = refreshTokenSchema.parse(request.body);
        const output = await container.refreshTokenCustomer.execute(body);
        reply.status(200).send({ status: 'success', data: output });
    }

    async registerMerchant(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = registerMerchantSchema.parse(request.body);
        const output = await container.registerMerchant.execute(body);
        reply.status(200).send({ status: 'success', data: output });
    }

    async loginMerchant(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = loginSchema.parse(request.body);
        const output = await container.loginMerchant.execute(body);
        reply.status(200).send({ status: 'success', data: output });
    }

    async refreshMerchant(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = refreshTokenSchema.parse(request.body);
        const output = await container.refreshTokenMerchant.execute(body);
        reply.status(200).send({ status: 'success', data: output });
    }
}