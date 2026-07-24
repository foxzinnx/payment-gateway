import type { FastifyReply, FastifyRequest } from "fastify";
import { apiKeyIdSchema, createApiKeySchema } from "../schemas/api-key.schema.js";
import { container } from "@/infra/container/index.js";

export class ApiKeyController {
    async createApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = createApiKeySchema.parse(request.body);

        const output = await container.createApiKey.execute(body);

        reply.status(201).send({ status: 'success', data: output });
    }

    async listApiKeys(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const output = await container.listApiKeys.execute();
        reply.status(200).send({ status: 'success', data: output });
    }

    async revokeApiKey(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = apiKeyIdSchema.parse(request.params);

        const output = await container.revokeApiKey.execute(id);

        reply.status(200).send({ status: 'success', data: output });
    }
}