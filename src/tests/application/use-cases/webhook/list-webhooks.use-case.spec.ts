import { DeactivateWebhookUseCase } from "@/application/use-cases/webhook/deactivate-webhook.use-case.js";
import { ListWebhooksUseCase } from "@/application/use-cases/webhook/list-webhooks.use-case.js";
import { RegisterWebhookUseCase } from "@/application/use-cases/webhook/register-webhook.use-case.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { InMemoryWebhookRepository } from "@/tests/repositories/in-memory-webhook.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('ListWebhooksUseCase', () => {
    let repository: InMemoryWebhookRepository;
    let sut: ListWebhooksUseCase;
    let registerUseCase: RegisterWebhookUseCase;
    let deactivateUseCase: DeactivateWebhookUseCase;

    beforeEach(() => {
        repository = new InMemoryWebhookRepository();
        sut = new ListWebhooksUseCase(repository);
        registerUseCase = new RegisterWebhookUseCase(repository);
        deactivateUseCase = new DeactivateWebhookUseCase(repository);
    });

    const merchantId = '37e7f4ac-cc26-4b4e-9a27-e167e1845a3d';

    it('should return empty list when merchant has no webhooks', async () => {
        const output = await sut.execute(merchantId);
        expect(output).toHaveLength(0);
    });

    it('should return all webhooks of a merchant', async () => {
        await registerUseCase.execute(merchantId, {
            url: 'https://capyfood.com/webhook',
            events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED]
        });

        await registerUseCase.execute(merchantId, {
            url: 'https://capyfoodbrasil.com/webhook',
            events: [WEBHOOK_EVENTS.TRANSACTION_FAILED]
        });

        const output = await sut.execute(merchantId);

        expect(output).toHaveLength(2);
    });

    it('should include inactive webhooks in the list', async () => {
        const registered = await registerUseCase.execute(merchantId, {
            url: 'https://capyfood.com/webhook',
            events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
        });

        await deactivateUseCase.execute(merchantId, registered.id);

        const output = await sut.execute(merchantId);

        expect(output).toHaveLength(1);
        expect(output[0]?.isActive).toBe(false);
    });

    it('should not return webhooks from other merchants', async () => {
        await registerUseCase.execute('fe3e7f22-8e82-42f8-81d9-ec55645b3081', {
            url: 'https://sistema-a.com/webhook',
            events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
        });

        await registerUseCase.execute('9b3201e6-e795-4657-a64b-eb155b560234', {
            url: 'https://sistema-b.com/webhook',
            events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
        });

        const outputA = await sut.execute('fe3e7f22-8e82-42f8-81d9-ec55645b3081');
        const outputB = await sut.execute('9b3201e6-e795-4657-a64b-eb155b560234');

        expect(outputA).toHaveLength(1);
        expect(outputB).toHaveLength(1);
        expect(outputA[0]?.merchantId).toBe('fe3e7f22-8e82-42f8-81d9-ec55645b3081');
        expect(outputB[0]?.merchantId).toBe('9b3201e6-e795-4657-a64b-eb155b560234');
    })

    it('should not expose secret in output', async () => {
        await registerUseCase.execute(merchantId, {
            url: 'https://capyfood.com/webhook',
            events: [WEBHOOK_EVENTS.TRANSACTION_APPROVED],
        });

        const output = await sut.execute(merchantId);

        expect(output[0]).not.toHaveProperty('secret');
    });
});