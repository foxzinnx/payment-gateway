import { DeactivateWebhookUseCase } from "@/application/use-cases/webhook/deactivate-webhook.use-case.js";
import { RegisterWebhookUseCase } from "@/application/use-cases/webhook/register-webhook.use-case.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { InMemoryWebhookRepository } from "@/tests/repositories/in-memory-webhook.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('DeactivateWebhookUseCase', () => {
    let repository: InMemoryWebhookRepository;
    let sut: DeactivateWebhookUseCase;
    let registerUseCase: RegisterWebhookUseCase;

    beforeEach(() => {
        repository = new InMemoryWebhookRepository();
        sut = new DeactivateWebhookUseCase(repository);
        registerUseCase = new RegisterWebhookUseCase(repository);
    });

    const merchantId = '37e7f4ac-cc26-4b4e-9a27-e167e1845a3d';

    describe('successful deactivation', () => {
        it('should deactivate an active webhook', async () => {
            const registered = await registerUseCase.execute(merchantId, {
                url: 'https://capyfood.com/webhook',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED]
            });

            const output = await sut.execute(merchantId, registered.id);

            expect(output.isActive).toBe(false);
            expect(repository.items[0]?.isActive).toBe(false);
        });

        it('should not delete the webhook, only deactivate', async () => {
            const registered = await registerUseCase.execute(merchantId, {
                url: 'https://capyfood.com/webhook',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED]
            });

            await sut.execute(merchantId, registered.id);

            expect(repository.items).toHaveLength(1);
        });
    });

    describe('authorization errors', () => {
        it('should throw UnauthorizedError when merchant does not own webhook', async () => {
            const registered = await registerUseCase.execute(merchantId, {
                url: 'https://capyfood.com/webhook',
                events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED]
            });

            await expect(
                sut.execute('fe3e7f22-8e82-42f8-81d9-ec55645b3081', registered.id)
            ).rejects.toThrowError(UnauthorizedError);
        });
    });

    describe('not found errors', () => {
        it('should throw NotFoundError when webhook does not exist', async () => {
            await expect(
                sut.execute(
                    merchantId,
                    '00000000-0000-0000-0000-000000000000'
                )
            ).rejects.toThrowError(NotFoundError)
        });
    });
});