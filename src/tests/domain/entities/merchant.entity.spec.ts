import { Merchant } from "@/domain/entities/merchant.entity.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { InvalidCNPJError } from "@/domain/errors/invalid-cnpj.error.js";
import { InvalidEmailError } from "@/domain/errors/invalid-email.error.js";
import { describe, expect, it } from "vitest";

describe('Merchant Entity', () => {
    const makeMerchant = (overrides = {}) =>
        Merchant.create({
            name: 'Empresa exemplo LTDA',
            tradeName: 'Exemplo Store',
            email: 'contato@exemplo.com',
            cnpj: '11.222.333/0001-81',
            ...overrides
        });

    describe('create', () => {
        it('should create a merchant with ACTIVE status by default', () => {
            const merchant = makeMerchant();
            expect(merchant.status).toBe('ACTIVE');
            expect(merchant.isActive).toBe(true);
        });

        it('should create a merchant with valid data', () => {
            const merchant = makeMerchant();
            expect(merchant.name).toBe('Empresa exemplo LTDA');
            expect(merchant.tradeName).toBe('Exemplo Store');
            expect(merchant.email.value).toBe('contato@exemplo.com');
            expect(merchant.cnpj.value).toBe('11222333000181')
        });

        it('should throw for invalid CNPJ', () => {
            expect(() => makeMerchant({ cnpj: '11.111.111/11111-11' })).toThrowError(InvalidCNPJError);
        });

        it('should throw for invalid email', () => {
            expect(() => makeMerchant({ email: 'invalid' })).toThrowError(InvalidEmailError);
        });
    });

    describe('suspend', () => {
        it('should suspend an active merchant', () => {
            const merchant = makeMerchant();
            merchant.suspend();
            expect(merchant.status).toBe('SUSPENDED');
            expect(merchant.isActive).toBe(false);
        });

        it('should throw when trying to suspend an inactive merchant', () => {
            const merchant = makeMerchant();
            merchant.deactivate();
            expect(() => merchant.suspend()).toThrowError(InvalidArgumentError);
        });
    });

    describe('activate', () => {
        it('should activate a suspended merchant', () => {
            const merchant = makeMerchant();
            merchant.suspend();
            merchant.activate();
            expect(merchant.status).toBe('ACTIVE');
        });

        it('should do nothing when activating an already active merchant', () => {
            const merchant = makeMerchant();
            expect(() => merchant.activate()).not.toThrow();
            expect(merchant.status).toBe('ACTIVE');
        });
    });

    describe('deactivate', () => {
        it('should deactivate an active merchant', () => {
            const merchant = makeMerchant();
            merchant.deactivate();
            expect(merchant.status).toBe('INACTIVE');
        });
    });

    describe('updateTradeName', () => {
        it('should update trade name correctly', () => {
            const merchant = makeMerchant();
            merchant.updateTradeName('Nova empresa');
            expect(merchant.tradeName).toBe('Nova empresa');
        });

        it('should throw for trade name shorter than 3 chars', () => {
            const merchant = makeMerchant();
            expect(() => merchant.updateTradeName('AB')).toThrowError(InvalidArgumentError);
        });
    });
})