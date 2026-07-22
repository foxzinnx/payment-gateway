import type { RegisterWebhookInputDTO, WebhookOutputDTO } from "@/application/dtos/webhook.dto.js";
import { Webhook } from "@/domain/entities/webhook.entity.js";
import type { WebhookRepository } from "@/domain/repositories/webhook.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import crypto from 'crypto'

export class RegisterWebhookUseCase {
    constructor(private readonly webhookRepository: WebhookRepository){}

    async execute(merchantId: string, input: RegisterWebhookInputDTO): Promise<WebhookOutputDTO>{
        const secret = crypto.randomBytes(32).toString('hex');
        const merchantIdVO = new UniqueEntityId(merchantId);

        const webhook = Webhook.create({
            merchantId: merchantIdVO,
            url: input.url,
            events: input.events,
            secret
        });

        await this.webhookRepository.save(webhook);

        return webhook.toOutputDTO()
    }
}