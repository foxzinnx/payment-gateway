import { Wallet } from "@/domain/entities/wallet.entity.js";
import { InsufficientFundsError } from "@/domain/errors/insufficient-funds.error.js";
import { Money } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { describe, expect, it } from "vitest";

describe('Wallet Entity', () => {
    const makeWallet = () => 
        Wallet.create(new UniqueEntityId(), 'CUSTOMER', 'BRL');

    describe('create', () => {
        it('should create a wallet with zero balance', () => {
            const wallet = makeWallet();
            expect(wallet.balance.isZero()).toBe(true);
            expect(wallet.currency).toBe('BRL');
            expect(wallet.ownerType).toBe('CUSTOMER');
        });

        describe('credit', () => {
            it('should increase balance after credit', () => {
                const wallet = makeWallet();
                wallet.credit(Money.create(1000, 'BRL'));
                expect(wallet.balance.amountInCents).toBe(1000);
            });

            it('should accumulate multiple credits', () => {
                const wallet = makeWallet();
                wallet.credit(Money.create(500, 'BRL'));
                wallet.credit(Money.create(300, 'BRL'));
                expect(wallet.balance.amountInCents).toBe(800);
            });

            it('should update updateAt on credit', () => {
                const wallet = makeWallet();
                const before = wallet.updatedAt;
                wallet.credit(Money.create(500, 'BRL'));
                expect(wallet.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
            });
        });
    });

    describe('debit', () => {
        it('should decrease balance after debit', () => {
            const wallet = makeWallet();
            wallet.credit(Money.create(1000, 'BRL'));
            wallet.debit(Money.create(500, 'BRL'));
            expect(wallet.balance.amountInCents).toBe(500);
        });

        it('should allow debit of entire balance', () => {
            const wallet = makeWallet();
            wallet.credit(Money.create(1000, 'BRL'));
            wallet.debit(Money.create(1000, 'BRL'));
            expect(wallet.balance.isZero()).toBe(true);
        });

        it('should throw InsufficientFundsError when balance is too low', () => {
            const wallet = makeWallet();
            wallet.credit(Money.create(100, 'BRL'));
            expect(() => wallet.debit(Money.create(200, 'BRL'))).toThrowError(InsufficientFundsError);
        });

        it('should throw InsufficientFundsError on empty wallet', () => {
            const wallet = makeWallet();
            expect(() => wallet.debit(Money.create(1, 'BRL'))).toThrowError(InsufficientFundsError);
        });
    });

    describe('hasEnoughBalance', () => {
        it('should return true when balance is sufficient', () => {
            const wallet = makeWallet();
            wallet.credit(Money.create(1000, 'BRL'));
            expect(wallet.hasEnoughBalance(Money.create(1000, 'BRL'))).toBe(true);
        });

        it('should return false when balance is insufficient', () => {
            const wallet = makeWallet();
            wallet.credit(Money.create(500, 'BRL'));
            expect(wallet.hasEnoughBalance(Money.create(600, 'BRL'))).toBe(false);
        });
    })
})