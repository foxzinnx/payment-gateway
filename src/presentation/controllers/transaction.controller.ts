import type { FastifyReply, FastifyRequest } from "fastify";
import { createTransactionSchema, transactionIdSchema } from "../schemas/transaction.schema.js";
import { container } from "@/infra/container/index.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import { paginationSchema } from "../schemas/pagination.schema.js";

export class TransactionController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const body = createTransactionSchema.parse(request.body);
        const customerId = request.user.sub

        const output = await container.createTransaction.execute(customerId, body);

        const status = output.status === 'APPROVED' ? 201 : 422

        reply.status(status).send({ status: 'success', data: output });
    }

    async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const { id } = transactionIdSchema.parse(request.params);

        const transaction = await container.getTransactionById.execute(id);

        const isOwner =
            transaction.customerId === request.user.sub ||
            transaction.merchantId === request.user.sub

        if(!isOwner){
            throw new UnauthorizedError('You can only view transactions you are part of')
        }

        reply.status(200).send({ status: 'success', data: transaction });
    }

    async listMyAsCustomer(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { page, limit } = paginationSchema.parse(request.query);
        const customerId = request.user.sub;

        const output = await container.getCustomerTransactions.execute(customerId, { page, limit });

        reply.status(200).send({ status: 'success', ...output })
    }

    async listMyAsMerchant(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { page, limit } = paginationSchema.parse(request.query);

        const merchantId = request.user.sub;
        const output = await container.getMerchantTransactions.execute(merchantId, { page, limit });

        reply.status(200).send({ status: 'success', ...output })
    }
}