import type { FastifyReply, FastifyRequest } from "fastify";
import { createTransactionSchema, transactionIdSchema } from "../schemas/transaction.schema.js";
import { container } from "@/infra/container/index.js";

export class TransactionController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const body = createTransactionSchema.parse(request.body);

        const customerId = request.user.sub

        const output = await container.createTransaction.execute(customerId, body);

        reply.status(201).send({ status: 'success', data: output });
    }

    async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const { id } = transactionIdSchema.parse(request.params);

        const output = await container.getTransactionById.execute(id);

        reply.status(200).send({ status: 'success', data: output });
    }
}