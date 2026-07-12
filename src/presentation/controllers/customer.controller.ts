import type { FastifyReply, FastifyRequest } from "fastify";
import { createCustomerSchema, customerIdSchema, updateCustomerSchema } from "../schemas/customer.schema.js";
import { container } from "@/infra/container/index.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";

export class CustomerController {
    async getMyProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const customerId = request.user.sub;

        const output = await container.getMyProfile.execute(customerId);

        reply.status(200).send({ status: 'success', data: output });
    }

    async update(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = customerIdSchema.parse(request.params);
        const body = updateCustomerSchema.parse(request.body);
          
        if (request.user.sub !== id) {
            throw new UnauthorizedError('You can only update your own account')
        }

        const output = await container.updateCustomer.execute(id, body);

        reply.status(200).send({ status: 'success', data: output });
    }
}