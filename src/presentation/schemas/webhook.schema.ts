import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import z from "zod";

export const registerWebhookSchema = z.object({
    url: z.url('Invalid URL'),
    events: z
        .array(z.enum(Object.values(WEBHOOK_EVENTS) as [string, ...string[]]))
        .min(1, 'At least one event must be specified')
});

export const webhookIdSchema = z.object({
    id: z.uuid('Invalid webhook ID')
})