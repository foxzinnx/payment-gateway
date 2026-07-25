import { container } from "@/infra/container/index.js";
import { serviceCustomerIdSchema, serviceRegisterCustomerSchema } from "@/presentation/schemas/service/service-customer.schema.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export class ServiceCustomerController {
    async register(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = serviceRegisterCustomerSchema.parse(request.body);

        const authResult = await container.registerCustomer.execute(body);

        const wallet = await container.createWallet.execute({
            ownerId: authResult.user.id,
            ownerType: 'CUSTOMER',
            currency: 'BRL'
        });

        reply.status(201).send({
            status: 'success',
            data: {
                customerId: authResult.user.id,
                walletId: wallet.id,
                accessToken: authResult.accessToken,
                refreshToken: authResult.refreshToken
            }
        })
    }

    async getWallet(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { customerId } = serviceCustomerIdSchema.parse(request.params);

        const wallet = await container.getWalletByOwnerId.execute(customerId);

        reply.status(200).send({ status: 'success', data: wallet });
    }
}