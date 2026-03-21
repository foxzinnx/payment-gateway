import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js';
import { Money } from '@/domain/value-objects/money.vo.js';
import { describe, expect, it } from 'vitest';

describe('Money VO', () => {
    describe('create', () => {
        it('should create a Money with valid amount in cents', () => {
            const money = Money.create(1000, 'BRL');
            expect(money.amountInCents).toBe(1000);
            expect(money.currency).toBe('BRL');
        });

        it('should create a zero money', () => {
            const money = Money.zero('BRL');
            expect(money.currency).toBe('BRL');
            expect(money.amountInCents).toBe(0);
            expect(money.isZero()).toBe(true);
        });

        it('should format the value correctly', () => {
            const money = Money.create(10050, 'BRL');
            expect(money.formatted).toBe('100.50');
        });

        it('should throw if amount is negative', () => {
            expect(() => Money.create(-1, 'BRL')).toThrowError(InvalidArgumentError);
        });

        it('should throw if amount is not an integer', () => {
            expect(() => Money.create(100.5, 'BRL')).toThrowError(InvalidArgumentError);
        });
    });

    describe('add', () => {
        it('should add two Money values correctly', () => {
            const a = Money.create(500, 'BRL');
            const b = Money.create(500, 'BRL');
            expect(a.add(b).amountInCents).toBe(1000);
        });

        it('should throw when adding different currencies', () => {
            const a = Money.create(500, 'BRL');
            const b = Money.create(500, 'USD');
            expect(() => a.add(b)).toThrowError(InvalidArgumentError);
        })
    });

    describe('subtract', () => {
        it('should subtract two Money values correctly', () => {
            const a = Money.create(500, 'BRL');
            const b = Money.create(300, 'BRL');
            expect(a.subtract(b).amountInCents).toBe(200);
        });

        it('should throw when subtracting different currencies', () => {
            const a = Money.create(500, 'BRL');
            const b = Money.create(500, 'EUR');
            expect(() => a.subtract(b)).toThrowError(InvalidArgumentError);
        })
    });

    describe('isGreaterThanOrEqual', () => {
        it('should return true when amount is greater', () => {
            const a = Money.create(500, 'BRL');
            const b = Money.create(300, 'BRL');
            expect(a.isGreaterThanOrEqual(b)).toBe(true);
        });

        it('should return true when amounts are equal', () => {
            const a = Money.create(300, 'BRL');
            const b = Money.create(300, 'BRL');
            expect(a.isGreaterThanOrEqual(b)).toBe(true);
        });

        it('should return false when amount is less', () => {
            const a = Money.create(100, 'BRL');
            const b = Money.create(300, 'BRL');
            expect(a.isGreaterThanOrEqual(b)).toBe(false);
        })
    });

    describe('equals', () => {
        it('should return true for equal Money values', () => {
            const a = Money.create(500, 'BRL');
            const b = Money.create(500, 'BRL');
            expect(a.equals(b)).toBe(true);
        });

        it('should return false for different amounts', () => {
            const a = Money.create(400, 'BRL');
            const b = Money.create(500, 'BRL');
            expect(a.equals(b)).toBe(false);
        });

        it('should return false for different currencies', () => {
            const a = Money.create(400, 'BRL');
            const b = Money.create(200, 'USD');
            expect(a.equals(b)).toBe(false);
        })
    })
})