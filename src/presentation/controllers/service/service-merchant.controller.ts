import { container } from "@/infra/container/index.js";
import { serviceMerchantIdSchema } from "@/presentation/schemas/service/service-deposit.schema.js";
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

    async getWallet(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { merchantId } = serviceMerchantIdSchema.parse(request.params);

        const output = await container.getWalletByOwnerId.execute(merchantId);

        reply.status(200).send({ status: 'success', data: output });
    }
}