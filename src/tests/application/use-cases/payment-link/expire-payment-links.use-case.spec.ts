import { ExpirePaymentLinksUseCase } from "@/application/use-cases/payment-link/expire-payment-links.use-case.js";
import { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryPaymentLinkRepository } from "@/tests/repositories/in-memory-payment-link.repository.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe('ExpirePaymentLinksUseCase', () => {
    let repository: InMemoryPaymentLinkRepository;
    let sut: ExpirePaymentLinksUseCase;

    const makeActiveLink = () =>
        PaymentLink.create({
            merchantId: new UniqueEntityId(),
            amountInCents: 5000,
            currency: 'BRL'
        });

    beforeEach(() => {
        repository = new InMemoryPaymentLinkRepository();
        sut = new ExpirePaymentLinksUseCase(repository);
        vi.useRealTimers();
    });

    describe('when no links are expired', () => {
        it('should return 0 expired links', async () => {
            await repository.save(makeActiveLink());
            await repository.save(makeActiveLink());

            const result = await sut.execute();

            expect(result.expired).toBe(0);
            expect(result.processedAt).toBeInstanceOf(Date);
        });

        it('should not modify any links', async () => {
            await repository.save(makeActiveLink());

            await sut.execute();

            expect(repository.items[0]?.status).toBe('ACTIVE');
        })
    });

    describe('when links are expired', () => {
        it('should expire all active links past their expiresAt', async () => {
            const link1 = makeActiveLink();
            const link2 = makeActiveLink();
            const link3 = makeActiveLink();

            await repository.save(link1);
            await repository.save(link2);
            await repository.save(link3);

            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000));

            const freshLink = makeActiveLink();
            await repository.save(freshLink);

            const result = await sut.execute();

            expect(result.expired).toBe(3);
            expect(result.processedAt).toBeInstanceOf(Date);

            const expiredLinks = repository.items.filter((l) => l.status === 'EXPIRED');
            const activeLinks = repository.items.filter((l) => l.status === 'ACTIVE');

            expect(expiredLinks).toHaveLength(3);
            expect(activeLinks).toHaveLength(1);

            vi.useRealTimers();
        });

        it('should not expire links with USED status', async () => {
            const usedLink = makeActiveLink()
            usedLink.markAsUsed()
            await repository.save(usedLink)

            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000))

            const result = await sut.execute()

            expect(result.expired).toBe(0)
            expect(usedLink.status).toBe('USED')

            vi.useRealTimers()
        })

        it('should not expire links already with EXPIRED status', async () => {
            const alreadyExpiredLink = makeActiveLink();
            alreadyExpiredLink.markAsExpired();
            await repository.save(alreadyExpiredLink);

            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000));

            const result = await sut.execute();

            expect(result.expired).toBe(0);

            vi.useRealTimers();
        });
    });

    describe('processedAt', () => {
        it('should return current timestamp in processedAt', async () => {
            const now = new Date('2026-01-01T12:00:00Z');
            vi.setSystemTime(now);

            const result = await sut.execute();

            expect(result.processedAt.getTime()).toBeGreaterThanOrEqual(
                now.getTime()
            );

            vi.useRealTimers();
        });
    });
})