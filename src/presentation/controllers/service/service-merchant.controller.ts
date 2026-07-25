import { container } from "@/infra/container/index.js";
import { serviceRegisterMerchantSchema } from "@/presentation/schemas/service/service-merchant.schema.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export class ServiceMerchantController {
    async register(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = serviceRegisterMerchantSchema.parse(request.body);

        const authResult = await container.registerMerchant.execute(body);

        const wallet = await container.createWallet.execute({
            ownerId: authResult.user.id,
            ownerType: 'MERCHANT',
            currency: 'BRL'
        });

        reply.status(201).send({
            status: 'success',
            data: {
                merchantId: authResult.user.id,
                walletId: wallet.id,
                accessToken: authResult.accessToken,
                refreshToken: authResult.refreshToken
            }
        })
    }
}