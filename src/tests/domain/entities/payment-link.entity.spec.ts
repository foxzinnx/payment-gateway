import { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import { PaymentLinkAlreadyUsedError, PaymentLinkAmountMustBePositiveError, PaymentLinkExpiredError } from "@/domain/errors/payment-link.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it, vi } from "vitest";

describe('PaymentLink Entity', () => {
    const makePaymentLink = (overrides = {}) =>
        PaymentLink.create({
            merchantId: new UniqueEntityId(),
            amountInCents: 5000,
            currency: 'BRL',
            ...overrides
        });

    describe('create', () => {
        it('should create a payment link with ACTIVE status', () => {
            const link = makePaymentLink();

            expect(link.status).toBe('ACTIVE');
            expect(link.isActive).toBe(true);
            expect(link.isUsed).toBe(false);
            expect(link.isExpired).toBe(false);
            expect(link.amount.amountInCents).toBe(5000);
            expect(link.usedAt).toBeNull();
            expect(link.description).toBeNull();
        });

        it('should generate a code in PAY-XXXXXX format', () => {
            const link = makePaymentLink();
            expect(link.code).toMatch(/^PAY-[A-Z0-9]{6}/);
        });

        it('should generate unique codes for different links', () => {
            const link1 = makePaymentLink();
            const link2 = makePaymentLink();
            expect(link1.code).not.toBe(link2.code)
        });

        it('should set expiresAt to 24 hours from now', () => {
            const before = new Date();
            const link = makePaymentLink();
            const after = new Date();

            const expectedMin = new Date(before.getTime() + 24 * 60 * 60 * 1000);
            const expectedMax = new Date(after.getTime() + 24 * 60 * 60 * 1000);

            expect(link.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
            expect(link.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
        });

        it('should create with description', () => {
            const link = makePaymentLink({ description: 'Produto X' });
            expect(link.description).toBe('Produto X');
        });

        it('should trim description whitespace', () => {
            const link = makePaymentLink({ description: '  Produto X ' });
            expect(link.description).toBe('Produto X');
        });

        it('should throw for non-positive amount', () => {
            expect(() => makePaymentLink({ amountInCents: 0 })).toThrowError(PaymentLinkAmountMustBePositiveError);
            expect(() => makePaymentLink({ amountInCents: -1000 })).toThrowError(PaymentLinkAmountMustBePositiveError);
        });
    });

    describe('validateForUse', () => {
        it('should not throw for an active link', () => {
            const link = makePaymentLink();
            expect(() => link.validateForUse()).not.toThrow();
        });

        it('should throw PaymentLinkAlreadyUsedError when link is used', () => {
            const link = makePaymentLink();
            link.markAsUsed();

            expect(() => link.validateForUse()).toThrowError(PaymentLinkAlreadyUsedError)
        });

        it('should throw PaymentLinkExpiredError when link is expired', () => {
            const link = makePaymentLink();

            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000));

            expect(() => link.validateForUse()).toThrowError(PaymentLinkExpiredError);

            vi.useRealTimers();
        });
    });

    describe('markAsUsed', () => {
        it('should mark an active link as used', () => {
            const link = makePaymentLink();
            link.markAsUsed();

            expect(link.status).toBe('USED');
            expect(link.isUsed).toBe(true);
            expect(link.usedAt).not.toBeNull();
        });

        it('should throw when marking an already used link', () => {
            const link = makePaymentLink();
            link.markAsUsed();

            expect(() => link.markAsUsed()).toThrowError(PaymentLinkAlreadyUsedError)
        });

        it('should throw when marking an expired link as used', () => {
            const link = makePaymentLink();

            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000));

            expect(() => link.markAsUsed()).toThrowError(PaymentLinkExpiredError);

            vi.useRealTimers();
        });

        it('should update updatedAt on markAsUsed', () => {
            const link = makePaymentLink();
            const before = link.updatedAt;
            link.markAsUsed();
            expect(link.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        })
    });

    describe('markAsExpired', () => {
        it('should mark an active link as expired', () => {
            const link = makePaymentLink();
            link.markAsExpired();

            expect(link.status).toBe('EXPIRED');
        });

        it('should not mark a used link as expired', () => {
            const link = makePaymentLink();
            link.markAsExpired();

            expect(link.status).toBe('EXPIRED');
        });

        it('should not mark a used link as expired', () => {
            const link = makePaymentLink();
            link.markAsUsed();
            link.markAsExpired();

            expect(link.status).toBe('USED');
        });

        it('should update updatedAt on markAsExpired', () => {
            const link = makePaymentLink();
            const before = link.updatedAt;
            link.markAsExpired();
            expect(link.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
        })
    });

    describe('isExpired getter', () => {
        it('should return false for a fresh link', () => {
            const link = makePaymentLink();
            expect(link.isExpired).toBe(false);
        });

        it('should return true when expiresAt is in the past', () => {
            const link = makePaymentLink();

            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000));

            expect(link.isExpired).toBe(true);

            vi.useRealTimers();
        });

        it('should return true when status is EXPIRED', () => {
            const link = makePaymentLink();
            link.markAsExpired();
            expect(link.isExpired).toBe(true);
        })
    });

    describe('toDetailsDTO', () => {
        it('should return correct details DTO', () => {
            const link = makePaymentLink({ description: 'Produto X' })
            const output = link.toDetailsDTO('Loja Exemplo')

            expect(output.code).toBe(link.code)
            expect(output.merchantName).toBe('Loja Exemplo')
            expect(output.amountInCents).toBe(5000)
            expect(output.amountFormatted).toBe('50.00')
            expect(output.currency).toBe('BRL')
            expect(output.description).toBe('Produto X')
            expect(output.expiresAt).toBe(link.expiresAt)
        })
    });

    describe('toOutputDTO', () => {
        it('should return correct output DTO', () => {
            const merchantId = new UniqueEntityId()
            const link = PaymentLink.create({
                merchantId,
                amountInCents: 5000,
                currency: 'BRL',
                description: 'Produto X',
            })

            const output = link.toOutputDTO()

            expect(output.id).toBe(link.id.value)
            expect(output.code).toMatch(/^PAY-[A-Z0-9]{6}$/)
            expect(output.merchantId).toBe(merchantId.value)
            expect(output.amountInCents).toBe(5000)
            expect(output.amountFormatted).toBe('50.00')
            expect(output.currency).toBe('BRL')
            expect(output.description).toBe('Produto X')
            expect(output.status).toBe('ACTIVE')
            expect(output.usedAt).toBeNull()
        })
    })
})