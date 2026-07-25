import { container } from "@/infra/container/index.js";
import { serviceCreateTransactionSchema, serviceRefundTransactionSchema, serviceTransactionIdSchema } from "@/presentation/schemas/service/service-transaction.schema.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export class ServiceTransactionController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = serviceCreateTransactionSchema.parse(request.body);

        const output = await container.createTransaction.execute(
            body.customerId,
            {
                merchantId: body.merchantId,
                amountInCents: body.amountInCents,
                currency: body.currency,
                description: body.description,
                idempotencyKey: body.idempotencyKey,
                metadata: body.metadata
            }
        )

        const status = output.status === 'APPROVED' ? 201 : 422;

        reply.status(status).send({ status: 'success', data: output });
    }

    async refund(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { transactionId } = serviceTransactionIdSchema.parse(request.params);
        const body = serviceRefundTransactionSchema.parse(request.body);

        const output = await container.createRefund.execute(body.merchantId, transactionId, { reason: body.reason });

        reply.status(201).send({ status: 'success', data: output });
    }

    async getById(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { transactionId } = serviceTransactionIdSchema.parse(request.params);

        const output = await container.getTransactionById.execute(transactionId);

        reply.status(200).send({ status: 'success', data: output });
    }
}