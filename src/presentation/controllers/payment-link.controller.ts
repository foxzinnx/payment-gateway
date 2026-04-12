import type { FastifyReply, FastifyRequest } from "fastify";
import { createPaymentLinkSchema, paymentLinkCodeSchema, payWithLinkSchema } from "../schemas/payment-link.schema.js";
import { container } from "@/infra/container/index.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";

export class PaymentLinkController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = createPaymentLinkSchema.parse(request.body);
        const merchantId = request.user.sub;

        const output = await container.createPaymentLink.execute(merchantId, body);

        reply.status(201).send({ status: 'success', data: output });
    }

    async getDetails(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const { code } = paymentLinkCodeSchema.parse(request.params);

        const output = await container.getPaymentLinkDetails.execute(code);

        reply.status(200).send({ status: 'success', data: output });
    }

    async pay(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        if(request.user.type !== 'CUSTOMER'){
            throw new UnauthorizedError('Only customers can pay with a payment link');
        }

        const body = payWithLinkSchema.parse(request.body);
        const customerId = request.user.sub;

        const output = await container.payWithLink.execute(customerId, body);

        const status = output.status === 'APPROVED' ? 201 : 422;

        reply.status(status).send({ status: 'success', data: output });
    }
}