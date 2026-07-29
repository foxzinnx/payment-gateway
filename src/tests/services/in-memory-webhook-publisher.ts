import type { WebhookEvent } from "@/domain/webhooks/webhook-event.js"

export class InMemoryWebhookPublisher{
    public calls: Array<{
        merchantId: string
        event: WebhookEvent
        data: object
    }> = [];

    async publish(merchantId: string, event: WebhookEvent, data: object): Promise<void>{
        this.calls.push({ merchantId, event, data });
    }

    wasPublished(event: WebhookEvent): boolean {
        return this.calls.some((c) => c.event === event);
    }

    lastCall(): { merchantId: string; event: WebhookEvent; data: object } | null {
        return this.calls.at(-1) ?? null;
    }

    clear(): void {
        this.calls = [];
    }
}