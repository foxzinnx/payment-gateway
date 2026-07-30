import { Refund } from "@/domain/entities/refund.entity.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { RefundAmountMustBePositiveError } from "@/domain/errors/refund-amount-must-be-positive.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

describe('Refund Entity', () => {
    const makeRefund = (overrides = {}) =>
        Refund.create({
            transactionId: new UniqueEntityId(),
            merchantId: new UniqueEntityId(),
            customerId: new UniqueEntityId(),
            amountInCents: 5000,
            currency: 'BRL',
            ...overrides
        });

    describe('create', () => {
        it('should create a refund with PENDING status', () => {
            const refund = makeRefund();

            expect(refund.status).toBe('PENDING');
            expect(refund.isPending).toBe(true);
            expect(refund.isCompleted).toBe(false);
            expect(refund.amount.amountInCents).toBe(5000);
            expect(refund.reason).toBeNull()
        });

        it('should create a refund with reason', () => {
            const refund = makeRefund({ reason: 'Product out of stock' });
            expect(refund.reason).toBe('Product out of stock');
        });

        it('should trim reason whitespace', () => {
            const refund = makeRefund({ reason: '  Product out of stock  ' });
            expect(refund.reason).toBe('Product out of stock');
        });

        it('should throw for non-positive amount', () => {
            expect(() => makeRefund({ amountInCents: 0 })).toThrowError(RefundAmountMustBePositiveError);
            expect(() => makeRefund({ amountInCents: -1000 })).toThrowError(RefundAmountMustBePositiveError);
        })
    });

    describe('complete', () => {
        it('should complete a pending refund', () => {
            const refund = makeRefund()
            refund.complete()

            expect(refund.status).toBe('COMPLETED')
            expect(refund.isCompleted).toBe(true)
            expect(refund.isPending).toBe(false)
        })

        it('should throw when completing a non-pending refund', () => {
            const refund = makeRefund()
            refund.complete()

            expect(() => refund.complete()).toThrowError(InvalidArgumentError)
        })

        it('should update updatedAt on complete', () => {
            const refund = makeRefund()
            const before = refund.updatedAt
            refund.complete()
            expect(refund.updatedAt.getTime()).toBeGreaterThanOrEqual(
                before.getTime()
            )
        })
    });

    describe('toOutputDTO', () => {
        it('should return correct output DTO', () => {
            const transactionId = new UniqueEntityId()
            const merchantId = new UniqueEntityId()
            const customerId = new UniqueEntityId()

            const refund = Refund.create({
                transactionId,
                merchantId,
                customerId,
                amountInCents: 5000,
                currency: 'BRL',
                reason: 'Product out of stock',
            })

            const output = refund.toOutputDTO()

            expect(output.id).toBe(refund.id.value)
            expect(output.transactionId).toBe(transactionId.value)
            expect(output.merchantId).toBe(merchantId.value)
            expect(output.customerId).toBe(customerId.value)
            expect(output.amountInCents).toBe(5000)
            expect(output.amountFormatted).toBe('50.00')
            expect(output.currency).toBe('BRL')
            expect(output.reason).toBe('Product out of stock')
            expect(output.status).toBe('PENDING')
        })
    })
})