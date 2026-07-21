import type { WebhookEvent } from "@/domain/webhooks/webhook-event.js";

export interface WebhookOutputDTO {
    id: string;
    merchantId: string;
    url: string;
    events: WebhookEvent[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}