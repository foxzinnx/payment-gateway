import { Customer } from "@/domain/entities/customer.entity.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { InvalidCPFError } from "@/domain/errors/invalid-cpf.error.js";
import { InvalidEmailError } from "@/domain/errors/invalid-email.error.js";
import { describe, expect, it } from "vitest";

describe('Customer Entity', () => {
    const makeCustomer = (overrides = {}) => 
        Customer.create({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25',
            ...overrides
        });
    
    describe('create', () => {
        it('should create a customer with valid data', () => {
            const customer = makeCustomer();
            expect(customer.name).toBe('John Doe');
            expect(customer.email.value).toBe('john@example.com');
            expect(customer.cpf.value).toBe('52998224725');
            expect(customer.phone).toBeNull();
        });

        it('should create a customer with phone', () => {
            const customer = makeCustomer({ phone: '11999999999' });
            expect(customer.phone).toBe('11999999999');
        });

        it('should throw for name shorter than 3 chars', () => {
            expect(() => makeCustomer({ name: 'Jo' })).toThrowError(InvalidArgumentError);
        });

        it('should throw for name longer than 100 chars', () => {
            expect(() => makeCustomer({ name: "A".repeat(101) })).toThrowError(InvalidArgumentError);
        });

        it('should throw for invalid email', () => {
            expect(() => makeCustomer({ email: 'invalid' })).toThrowError(InvalidEmailError);
        });

        it('should throw for invalid CPF', () => {
            expect(() => makeCustomer({ cpf: '111.111.111-11' })).toThrowError(InvalidCPFError);
        });
    });

    describe('updateEmail', () => {
        it('should update email correctly', () => {
            const customer = makeCustomer();
            customer.updateEmail('email@gmail.com');
            expect(customer.email.value).toBe('email@gmail.com');
        });

        it('should throw for invalid email on update', () => {
            const customer = makeCustomer();
            expect(() => customer.updateEmail('not-is-email')).toThrowError(InvalidEmailError);            
        });
    });

    describe('updatePhone', () => {
        it('should update phone correctly', () => {
            const customer = makeCustomer();
            customer.updatePhone('11999248902');
            expect(customer.phone).toBe('11999248902');
        });

        it('should allow setting phone is null', () => {
            const customer = makeCustomer({ phone: '11999248902' });
            customer.updatePhone(null);
            expect(customer.phone).toBeNull();
        });
    });
})