import { container } from "@/infra/container/index.js";
import { serviceCreateDepositSchema } from "@/presentation/schemas/service/service-deposit.schema.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export class ServiceDepositController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = serviceCreateDepositSchema.parse(request.body);

        const output = await container.createDeposit.execute(
            body.customerId,
            {
                amountInCents: body.amountInCents,
                currency: body.currency,
                method: body.method
            }
        )

        return reply.status(201).send({ status: 'success', data: output });
    }
}