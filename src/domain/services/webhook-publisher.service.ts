import type { WebhookEvent } from "../webhooks/webhook-event.js";

export interface WebhookPublisherService {
    publish(merchantId: string, event: WebhookEvent, data: object): Promise<void>;
}