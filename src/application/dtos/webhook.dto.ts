import type { WebhookEvent } from "@/domain/webhooks/webhook-event.js";

export interface RegisterWebhookInputDTO {
    url: string;
    events: WebhookEvent[];
}

export interface WebhookOutputDTO {
    id: string;
    merchantId: string;
    url: string;
    events: WebhookEvent[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface WebhookRegistrationOutputDTO extends WebhookOutputDTO {
    secret: string;
}