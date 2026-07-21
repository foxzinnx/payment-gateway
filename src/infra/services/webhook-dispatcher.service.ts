import type { Webhook } from "@/domain/entities/webhook.entity.js";
import type { WebhookPayload } from "@/domain/webhooks/webhook-event.js";
import crypto from 'crypto'
import { prisma } from "../database/prisma/prisma.client.js";

export class WebhookDispatcherService {
    async dispatch(webhook: Webhook, payload: WebhookPayload): Promise<void> {
        const body = JSON.stringify(payload);
        const signature = this.sign(body, webhook.secret);

        const delivery = await prisma.webhookDelivery.create({
            data: {
                webhookId: webhook.id.value,
                event: payload.event,
                payload: payload as object,
                status: 'PENDING',
                attempts: 1,
                lastAttemptAt: new Date()
            }
        });

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-PayFlow-Signature': signature,
                    'X-PayFlow-Event': payload.event,
                    'X-PayFlow-Delivery': delivery.id,
                    'User-Agent': 'PayFlow-Webhook/1.0' 
                },
                body,
                signal: AbortSignal.timeout(10000)
            });

            await prisma.webhookDelivery.update({
                where: { id: delivery.id },
                data: {
                    status: response.ok ? 'SUCCESS' : 'FAILED',
                    statusCode: response.status
                }
            })
        } catch (error) {
            await prisma.webhookDelivery.update({
                where: { id: delivery.id },
                data: {
                    status: 'FAILED',
                    statusCode: null
                }
            })
        }
    }

    private sign(body: string, secret: string): string {
        return crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex')
    }
}

export const webhookDispatcher = new WebhookDispatcherService()