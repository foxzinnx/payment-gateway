import type { FastifyReply, FastifyRequest } from "fastify";
import { createCustomerSchema, customerIdSchema, updateCustomerSchema } from "../schemas/customer.schema.js";
import { container } from "@/infra/container/index.js";

export class CustomerController {
    async create(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = createCustomerSchema.parse(request.body);

        const output = await container.createCustomer.execute(body);

        reply.status(201).send({ status: 'success', data: output })
    }

    async getById(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = customerIdSchema.parse(request.params);

        const output = await container.getCustomerById.execute(id);

        reply.status(200).send({ status: 'success', data: output});
    }

    async update(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = customerIdSchema.parse(request.params);
        const body = updateCustomerSchema.parse(request.body);

        const output = await container.updateCustomer.execute(id, body);

        reply.status(200).send({ status: 'success', data: output });
    }
}