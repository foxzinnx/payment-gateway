import { Deposit } from "@/domain/entities/deposit.entity.js";
import { DepositAmountMustBePositiveError } from "@/domain/errors/deposit-amount-must-be-positive.error.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

describe('Deposit Entity', () => {
    const makeDeposit = (overrides = {}) =>
        Deposit.create({
            customerId: new UniqueEntityId(),
            walletId: new UniqueEntityId(),
            amountInCents: 5000,
            currency: 'BRL',
            method: 'PIX',
            ...overrides
        })

    describe('create', () => {
        it('should create a deposit with PENDING status', () => {
            const deposit = makeDeposit();

            expect(deposit.status).toBe('PENDING');
            expect(deposit.isPending).toBe(true);
            expect(deposit.isCompleted).toBe(false);
            expect(deposit.isFailed).toBe(false);
            expect(deposit.amount.amountInCents).toBe(5000);
            expect(deposit.currency).toBe('BRL');
            expect(deposit.method).toBe('PIX');
        });

        it('should create a deposit with default currency BRL', () => {
            const deposit = Deposit.create({
                customerId: new UniqueEntityId(),
                walletId: new UniqueEntityId(),
                amountInCents: 5000
            });
            expect(deposit.method).toBe('PIX');
        });

        it('should create a deposit with default method PIX', () => {
            const deposit = Deposit.create({
                customerId: new UniqueEntityId(),
                walletId: new UniqueEntityId(),
                amountInCents: 5000
            });
            expect(deposit.method).toBe('PIX');
        });

        it('should create a deposit with TED method', () => {
            const deposit = makeDeposit({ method: 'TED' })
            expect(deposit.method).toBe('TED');
        });

        it('should create a deposit with BOLETO method', () => {
            const deposit = makeDeposit({ method: 'BOLETO' })
            expect(deposit.method).toBe('BOLETO');
        });

        it('should throw for non-positive amount', () => {
            expect(() => makeDeposit({ amountInCents: 0 })).toThrowError(DepositAmountMustBePositiveError)
            expect(() => makeDeposit({ amountInCents: -100 })).toThrowError(DepositAmountMustBePositiveError)
        })
    });

    describe('complete', () => {
        it('should complete a pending deposit', () => {
            const deposit = makeDeposit();
            deposit.complete();

            expect(deposit.status).toBe('COMPLETED');
            expect(deposit.isCompleted).toBe(true);
            expect(deposit.isPending).toBe(false);
        });

        it('should throw when completing a non-pending deposit', () => {
            const deposit = makeDeposit();
            deposit.complete();

            expect(() => deposit.complete()).toThrowError(InvalidArgumentError)
        });

        it('should update updatedAt on complete', () => {
            const deposit = makeDeposit();
            const before = deposit.updatedAt;
            deposit.complete();

            expect(deposit.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
        })
    });

    describe('fail', () => {
        it('should fail a pending deposit', () => {
            const deposit = makeDeposit();
            deposit.fail();

            expect(deposit.status).toBe('FAILED');
            expect(deposit.isFailed).toBe(true);
            expect(deposit.isPending).toBe(false)
        });

        it('should throw when failing a non-pending deposit', () => {
            const deposit = makeDeposit();
            deposit.complete();

            expect(() => deposit.fail()).toThrowError(InvalidArgumentError)
        });

        it('should update updatedAt on fail', () => {
            const deposit = makeDeposit();
            const before = deposit.updatedAt;
            deposit.fail();

            expect(deposit.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
        })
    });

    describe('toOutputDTO', () => {
        it('should return correct output DTO', () => {
            const customerId = new UniqueEntityId()
            const walletId = new UniqueEntityId()
            const deposit = Deposit.create({
                customerId,
                walletId,
                amountInCents: 5000,
                currency: 'BRL',
                method: 'PIX',
            });

            const output = deposit.toOutputDTO()

            expect(output.id).toBe(deposit.id.value)
            expect(output.customerId).toBe(customerId.value)
            expect(output.walletId).toBe(walletId.value)
            expect(output.amountInCents).toBe(5000)
            expect(output.amountFormatted).toBe('50.00')
            expect(output.currency).toBe('BRL')
            expect(output.status).toBe('PENDING')
            expect(output.method).toBe('PIX')
        })
    })
})