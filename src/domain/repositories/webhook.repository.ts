import type { Webhook } from "../entities/webhook.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import type { WebhookEvent } from "../webhooks/webhook-event.js";

export interface WebhookRepository {
    findById(id: UniqueEntityId): Promise<Webhook | null>;
    findAllByMerchantId(merchantId: UniqueEntityId): Promise<Webhook[]>;
    findActiveByMerchantIdAndEvent(merchantId: UniqueEntityId, event: WebhookEvent): Promise<Webhook[]>;
    save(webhook: Webhook): Promise<void>;
    update(webhook: Webhook): Promise<void>;
}