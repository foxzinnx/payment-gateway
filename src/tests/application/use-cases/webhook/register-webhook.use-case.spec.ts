import { RegisterWebhookUseCase } from "@/application/use-cases/webhook/register-webhook.use-case.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { InMemoryWebhookRepository } from "@/tests/repositories/in-memory-webhook.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('RegisterWebhookUseCase', () => {
    let repository: InMemoryWebhookRepository;
    let sut: RegisterWebhookUseCase;

    beforeEach(() => {
        repository = new InMemoryWebhookRepository();
        sut = new RegisterWebhookUseCase(repository);
    });

    const merchantId = '37e7f4ac-cc26-4b4e-9a27-e167e1845a3d';

    describe('successful registration', () => {
        it('should register a webhook with valid data', async () => {
            const output = await sut.execute(merchantId, {
                url: 'https://capyfood.com/webhooks/payflow',
                events: [
                    WEBHOOK_EVENTS.TRANSACTION_APPROVED,
                    WEBHOOK_EVENTS.TRANSACTION_FAILED
                ]
            });

            expect(output.id).toBeDefined();
            expect(output.merchantId).toBe(merchantId);
            expect(output.url).toBe('https://capyfood.com/webhooks/payflow');
            expect(output.events).toContain(WEBHOOK_EVENTS.TRANSACTION_APPROVED);
            expect(output.events).toContain(WEBHOOK_EVENTS.TRANSACTION_FAILED);
            expect(output.isActive).toBe(true);
            expect(repository.items).toHaveLength(1);
        });

        it('should generate a unique secret for each webhook', async () => {
            const first = await sut.execute(merchantId, {
                url: 'https://capyfood.com/webhooks/payflow',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED]
            });

            const second = await sut.execute(merchantId, {
                url: 'https://other.com/webhooks/payflow',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED]
            });

            expect(repository.items[0]?.secret).not.toBe(repository.items[1]?.secret);
        });

        it('should register webhook with all available events', async () => {
            const output = await sut.execute(merchantId, {
                url: 'https://capyfood.com/webhooks/payflow',
                events: Object.values(WEBHOOK_EVENTS),
            });

            expect(output.events).toHaveLength(
                Object.values(WEBHOOK_EVENTS).length
            );
        });

        it('should allow same merchant to register multiple webhooks', async () => {
            await sut.execute(merchantId, {
                url: 'https://sistema-a.com/webhook',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
            });

            await sut.execute(merchantId, {
                url: 'https://sistema-b.com/webhook',
                events: [WEBHOOK_EVENTS.TRANSACTION_FAILED],
            });

            expect(repository.items).toHaveLength(2);
        });
    });

    describe('validation errors', () => {
        it('should throw for invalid URL', async () => {
            await expect(
                sut.execute(merchantId, {
                url: 'not-a-valid-url',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
                })
            ).rejects.toThrowError(InvalidArgumentError);
        });

        it('should throw for empty events array', async () => {
            await expect(
                sut.execute(merchantId, {
                url: 'https://meu-sistema.com/webhook',
                events: [],
                })
            ).rejects.toThrowError(InvalidArgumentError);
        });

        it('should throw for non-HTTP URL', async () => {
            await expect(
                sut.execute(merchantId, {
                url: 'ftp://meu-sistema.com/webhook',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
                })
            ).rejects.toThrowError(InvalidArgumentError);
        });
    });
});