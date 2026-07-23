import type { FastifyReply, FastifyRequest } from "fastify";
import { registerWebhookSchema, webhookIdSchema } from "../schemas/webhook.schema.js";
import { container } from "@/infra/container/index.js";

export class WebhookController {
    async register(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const body = registerWebhookSchema.parse(request.body);
        const merchantId = request.user.sub;

        const output = await container.registerWebhook.execute(merchantId, body);

        reply.status(201).send({ status: 'success', data: output })
    }

    async list(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const merchantId = request.user.sub;

        const output = await container.listWebhooks.execute(merchantId);

        reply.status(200).send({ status: 'success', data: output })
    }

    async deactivate(request: FastifyRequest, reply: FastifyReply): Promise<void>{
        const { id } = webhookIdSchema.parse(request.params);
        const merchantId = request.user.sub;

        const output = await container.deactivateWebhook.execute(merchantId, id);

        reply.status(200).send({ status: 'success', data: output });
    }
}