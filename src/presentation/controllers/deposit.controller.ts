import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { createDepositSchema } from "../schemas/deposit.schema.js";
import { container } from "@/infra/container/index.js";

export class DepositController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        if(request.user.type !== 'CUSTOMER'){
            throw new UnauthorizedError('Only customers can make deposits')
        }

        const body = createDepositSchema.parse(request.body);
        const customerId = request.user.sub;

        const output = await container.createDeposit.execute(customerId, body);

        reply.status(201).send({ status: 'success', data: output });
    }

    async listMine(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        if(request.user.type !== 'CUSTOMER'){
            throw new UnauthorizedError('Only customers can make deposits')
        }

        const customerId = request.user.sub;

        const output = await container.getCustomerDeposits.execute(customerId);

        reply.status(200).send({ status: 'success', data: output });
    }
}