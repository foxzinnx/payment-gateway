import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import z from "zod";

const WebhookEventEnum = z.nativeEnum(WEBHOOK_EVENTS);

export const registerWebhookSchema = z.object({
    url: z.url('Invalid URL'),
    events: z
        .array(WebhookEventEnum)
        .min(1, 'At least one event must be specified')
        .default([])
});

export const webhookIdSchema = z.object({
    id: z.uuid('Invalid webhook ID')
})