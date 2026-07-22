import type { WebhookOutputDTO } from "@/application/dtos/webhook.dto.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import type { WebhookRepository } from "@/domain/repositories/webhook.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class DeactivateWebhookUseCase {
    constructor(private readonly webhookRepository: WebhookRepository){}

    async execute(merchantId: string, webhookId: string): Promise<WebhookOutputDTO>{
        const webhookIdVO = new UniqueEntityId(webhookId);
        const webhook = await this.webhookRepository.findById(webhookIdVO);
        if(!webhook) throw new NotFoundError('Webhook');

        if(webhook.merchantId.value !== merchantId){
            throw new UnauthorizedError('You can only manage your own webhooks')
        }

        webhook.deactivate();
        await this.webhookRepository.update(webhook);

        return webhook.toOutputDTO();
    }
}