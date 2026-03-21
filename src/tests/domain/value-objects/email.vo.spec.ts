import { InvalidEmailError } from "@/domain/errors/invalid-email.error.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { describe, expect, it } from "vitest";

describe('Email VO', () => {
    it('should create a valid email', () => {
        const email = Email.create('user@example.com');
        expect(email.value).toBe('user@example.com');
    });

    it('should normalize email to lowercase', () => {
        const email = Email.create('USER@EXAMPLE.COM');
        expect(email.value).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
        const email = Email.create('   user@example.com   ');
        expect(email.value).toBe('user@example.com');
    });

    it('should throw for invalid email format', () => {
        expect(() => Email.create('invalid-email')).toThrowError(InvalidEmailError);
        expect(() => Email.create('missing@')).toThrowError(InvalidEmailError);
        expect(() => Email.create('@domain.com')).toThrowError(InvalidEmailError);
        expect(() => Email.create('')).toThrowError(InvalidEmailError);
    });

    it('should return true for equal emails', () => {
        const a = Email.create('user@example.com');
        const b = Email.create('user@example.com');
        expect(a.equals(b)).toBe(true);
    });
})