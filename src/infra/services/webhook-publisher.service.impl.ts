import type { WebhookRepository } from "@/domain/repositories/webhook.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { WebhookEvent, WebhookPayload } from "@/domain/webhooks/webhook-event.js";
import { webhookDispatcher } from "./webhook-dispatcher.service.js";
import type { WebhookPublisherService } from "@/domain/services/webhook-publisher.service.js";

export class WebhookPublisherServiceImpl implements WebhookPublisherService {
    constructor(private readonly webhookRepository: WebhookRepository){}

    async publish(merchantId: string, event: WebhookEvent, data: object): Promise<void>{
        const merchantIdVO = new UniqueEntityId(merchantId);
        const webhooks = await this.webhookRepository.findActiveByMerchantIdAndEvent(merchantIdVO, event);

        if(webhooks.length === 0) return;

        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            data
        }

        await Promise.allSettled(
            webhooks.map((webhook) => webhookDispatcher.dispatch(webhook, payload))
        )
    }
}