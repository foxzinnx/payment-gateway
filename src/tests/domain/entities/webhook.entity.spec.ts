import { Webhook } from "@/domain/entities/webhook.entity.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { describe, expect, it } from "vitest";

describe('Webhook Entity', () => {
    const makeWebhook = (overrides = {}) =>
        Webhook.create({
            merchantId: new UniqueEntityId(),
            url: 'https://capyfood.com/webhooks/payflow',
            events: [
                WEBHOOK_EVENTS.TRANSACTION_APPROVED,
                WEBHOOK_EVENTS.TRANSACTION_FAILED
            ],
            secret: 'secret-hash-abc123',
            ...overrides
        });

    describe('create', () => {
        it('should create a webhook with isActive true by default', () => {
            const webhook = makeWebhook();

            expect(webhook.isActive).toBe(true);
            expect(webhook.url).toBe('https://capyfood.com/webhooks/payflow');
            expect(webhook.events).toHaveLength(2);
            expect(webhook.secret).toBe('secret-hash-abc123');
        });

        it('should throw for invalid URL', () => {
            expect(() => makeWebhook({ url: 'not-a-url' })).toThrowError(InvalidArgumentError)
        });

        it('should throw for non-HTTP/HTTPS URL', () => {
            expect(() => makeWebhook({ url: 'ftp://capyfood.com/webhook' })).toThrowError(InvalidArgumentError);
        });

        it('should accept HTTP URL', () => {
            const webhook = makeWebhook({ url: 'http://localhost:3000/webhook' });
            expect(webhook.url).toBe('http://localhost:3000/webhook');
        });

        it('should throw for empty events array', () => {
            expect(() => makeWebhook({ events: [] })).toThrowError(InvalidArgumentError);
        })
    });

    describe('listensTo', () => {
        it('should return true for subscribed events', () => {
            const webhook = makeWebhook();

            expect(webhook.listensTo(WEBHOOK_EVENTS.TRANSACTION_APPROVED)).toBe(true);
            expect(webhook.listensTo(WEBHOOK_EVENTS.TRANSACTION_FAILED)).toBe(true);
        });

        it('should return false for non-subscribed events', () => {
            const webhook = makeWebhook()

            expect(webhook.listensTo(WEBHOOK_EVENTS.TRANSACTION_REFUNDED)).toBe(false)
            expect(webhook.listensTo(WEBHOOK_EVENTS.DEPOSIT_COMPLETED)).toBe(false)
        });
    });

    describe('deactivate', () => {
        it('should deactivate an active webhook', () => {
            const webhook = makeWebhook();
            webhook.deactivate();

            expect(webhook.isActive).toBe(false);
        })

        it('should update updatedAt on deactivate', () => {
            const webhook = makeWebhook();
            const before = webhook.updatedAt
            webhook.deactivate();
            expect(webhook.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        });
    });

    describe('activate', () => {
        it('should activate a deactivated webhook', () => {
            const webhook = makeWebhook()
            webhook.deactivate()
            webhook.activate()

            expect(webhook.isActive).toBe(true)
        })

        it('should update updatedAt on activate', () => {
            const webhook = makeWebhook()
            webhook.deactivate()
            const before = webhook.updatedAt
            webhook.activate()
            expect(webhook.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
        })
    })

    describe('toOutputDTO', () => {
        it('should return correct output DTO', () => {
            const merchantId = new UniqueEntityId()
            const webhook = Webhook.create({
                merchantId,
                url: 'https://capyfood.com/webhooks/payflow',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
                secret: 'secret-abc',
            })

            const output = webhook.toOutputDTO()

            expect(output.id).toBe(webhook.id.value)
            expect(output.merchantId).toBe(merchantId.value)
            expect(output.url).toBe('https://capyfood.com/webhooks/payflow')
            expect(output.events).toEqual([WEBHOOK_EVENTS.TRANSACTION_APPROVED])
            expect(output.isActive).toBe(true)

            expect(output).not.toHaveProperty('secret')
        })
    })
})