import type { Webhook } from "@/domain/entities/webhook.entity.js";
import type { WebhookRepository } from "@/domain/repositories/webhook.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { WebhookEvent } from "@/domain/webhooks/webhook-event.js";

export class InMemoryWebhookRepository implements WebhookRepository {
    public items: Webhook[] = [];
    
    async findById(id: UniqueEntityId): Promise<Webhook | null> {
        return this.items.find((w) => w.id.equals(id)) ?? null;
    }

    async findAllByMerchantId(merchantId: UniqueEntityId): Promise<Webhook[]> {
        return this.items.filter((w) => w.merchantId.equals(merchantId));
    }

    async findActiveByMerchantIdAndEvent(merchantId: UniqueEntityId, event: WebhookEvent): Promise<Webhook[]> {
        return this.items.filter(
            (w) =>
                w.merchantId.equals(merchantId) &&
                w.isActive &&
                w.listensTo(event)
        )
    }

    async save(webhook: Webhook): Promise<void> {
        this.items.push(webhook);
    }

    async update(webhook: Webhook): Promise<void> {
        const index = this.items.findIndex((w) => w.id.equals(webhook.id));
        if(index >= 0) this.items[index] = webhook;
    }
}