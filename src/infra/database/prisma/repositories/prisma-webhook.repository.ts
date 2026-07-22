import { Webhook } from "@/domain/entities/webhook.entity.js";
import type { WebhookRepository } from "@/domain/repositories/webhook.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { WebhookEvent } from "@/domain/webhooks/webhook-event.js";
import { prisma } from "../prisma.client.js";
import { WebhookMapper } from "../mappers/webhook.mapper.js";

export class PrismaWebhookRepository implements WebhookRepository{
    async findById(id: UniqueEntityId): Promise<Webhook | null> {
        const raw = await prisma.webhook.findUnique({
            where: { id: id.value }
        });
        if(!raw) return null;
        return WebhookMapper.toDomain(raw);
    }

    async findAllByMerchantId(merchantId: UniqueEntityId): Promise<Webhook[]> {
        const raws = await prisma.webhook.findMany({
            where: { merchantId: merchantId.value },
            orderBy: { createdAt: 'desc' }
        });
        return raws.map(WebhookMapper.toDomain)
    }

    async findActiveByMerchantIdAndEvent(merchantId: UniqueEntityId, event: WebhookEvent): Promise<Webhook[]> {
        const raws = await prisma.webhook.findMany({
            where: { 
                merchantId: merchantId.value,
                isActive: true,
                events: { has: event }
             }
        });

        return raws.map(WebhookMapper.toDomain)
    }

    async save(webhook: Webhook): Promise<void> {
        await prisma.webhook.create({
            data: WebhookMapper.toPrisma(webhook)
        })
    }

    async update(webhook: Webhook): Promise<void> {
        const data = WebhookMapper.toPrisma(webhook);
        await prisma.webhook.update({
            where: { id: data.id },
            data
        })
    }

}