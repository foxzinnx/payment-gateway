import type { FastifyReply, FastifyRequest } from "fastify";
import { createRefundSchema, refundTransactionIdSchema } from "../schemas/refund.schema.js";
import { container } from "@/infra/container/index.js";

export class RefundController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { transactionId } = refundTransactionIdSchema.parse(request.params);
        const body = createRefundSchema.parse(request.body);
        const merchantId = request.user.sub;

        const output = await container.createRefund.execute(
            merchantId,
            transactionId,
            body
        );

        reply.status(201).send({ status: 'success', data: output });
    }
}