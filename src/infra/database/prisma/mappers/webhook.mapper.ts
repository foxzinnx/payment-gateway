import { Webhook } from "@/domain/entities/webhook.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { WebhookEvent } from "@/domain/webhooks/webhook-event.js";
import type { Webhook as PrismaWebhook } from "generated/prisma/client.js";

export class WebhookMapper {
    static toDomain(raw: PrismaWebhook): Webhook {
        return Webhook.reconstitute(
            {
                merchantId: new UniqueEntityId(raw.merchantId),
                url: raw.url,
                events: raw.events as WebhookEvent[],
                secret: raw.secret,
                isActive: raw.isActive,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(webhook: Webhook){
        return {
            id: webhook.id.value,
            merchantId: webhook.merchantId.value,
            url: webhook.url,
            events: webhook.events,
            secret: webhook.secret,
            isActive: webhook.isActive,
            createdAt: webhook.createdAt,
            updatedAt: webhook.updatedAt
        }
    }
}