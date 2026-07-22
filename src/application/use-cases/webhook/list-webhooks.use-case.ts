import type { WebhookOutputDTO } from "@/application/dtos/webhook.dto.js";
import type { WebhookRepository } from "@/domain/repositories/webhook.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class ListWebhooksUseCase {
    constructor(private readonly webhookRepository: WebhookRepository){}

    async execute(merchantId: string): Promise<WebhookOutputDTO[]> {
        const merchantIdVO = new UniqueEntityId(merchantId);
        const webhooks = await this.webhookRepository.findAllByMerchantId(merchantIdVO);

        return webhooks.map((w) => w.toOutputDTO())
    }
}