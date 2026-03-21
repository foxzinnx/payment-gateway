import { InvalidCPFError } from "@/domain/errors/invalid-cpf.error.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { describe, expect, it } from "vitest";

describe('CPF VO', () => {
    it('should create a valid CPF with mask', () => {
        const cpf = CPF.create('529.982.247-25');
        expect(cpf.value).toBe('52998224725');
    });

    it('should create a valid CPF without mask', () => {
        const cpf = CPF.create('52998224725');
        expect(cpf.value).toBe('52998224725');
    });

    it('should return formatted CPF', () => {
        const cpf = CPF.create('52998224725');
        expect(cpf.formatted).toBe('529.982.247-25');
    });

    it('should throw for CPF with all equal digits', () => {
        expect(() => CPF.create('111.111.111-111')).toThrowError(InvalidCPFError);
        expect(() => CPF.create('00000000000')).toThrowError(InvalidCPFError);
    });

    it('should throw for invalid CPF', () => {
        expect(() => CPF.create('123.456.789-00')).toThrowError(InvalidCPFError);
        expect(() => CPF.create('000.000.000-00')).toThrowError(InvalidCPFError);
    });

    it('should throw for CPF with wrong length', () => {
        expect(() => CPF.create('124567')).toThrowError(InvalidCPFError);
    });

    it('should return true for equal CPFs', () => {
        const cpf1 = CPF.create('529.982.247-25');
        const cpf2 = CPF.create('52998224725');
        expect(cpf1.equals(cpf2)).toBe(true);
    });
})