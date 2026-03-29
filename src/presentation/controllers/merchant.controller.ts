import type { FastifyReply, FastifyRequest } from "fastify";
import { createMerchantSchema, merchantIdSchema, updateMerchantSchema } from "../schemas/merchant.schema.js";
import { container } from "@/infra/container/index.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";

export class MerchantController {
    async getById(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = merchantIdSchema.parse(request.params);

        const output = await container.getMerchantById.execute(id);

        reply.status(200).send({ status: 'success', data: output });
    }

    async update(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = merchantIdSchema.parse(request.params);
        const body = updateMerchantSchema.parse(request.body);

        if (request.user.sub !== id) {
            throw new UnauthorizedError('You can only update your own account')
        }

        const output = await container.updateMerchant.execute(id, body);

        reply.status(200).send({ status: 'success', data: output});
    }

    async suspend(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = merchantIdSchema.parse(request.params);

        if(request.user.sub !== id){
            throw new UnauthorizedError('You can only suspend your own account');
        }

        const output = await container.suspendMerchant.execute(id);

        reply.status(200).send({ status: 'success', data: output });
    }
}