import { InvalidCNPJError } from "@/domain/errors/invalid-cnpj.error.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { describe, expect, it } from "vitest";

describe('CNPJ VO', () => {
    it('should create a valid CNPJ with mask', () => {
        const cnpj = CNPJ.create('11.222.333/0001-81');
        expect(cnpj.value).toBe('11222333000181');
    });

    it('should create a valid CNPJ without mask', () => {
        const cnpj = CNPJ.create('11222333000181');
        expect(cnpj.value).toBe('11222333000181');  
    })

    it('should return formatted CNPJ', () => {
        const cnpj = CNPJ.create('11222333000181');
        expect(cnpj.formatted).toBe('11.222.333/0001-81');
    });

    it('should throw for CNPJ with all equal digits', () => {
        expect(() => CNPJ.create('11.111.111/1111-11')).toThrowError(InvalidCNPJError);
    });

    it('should throw for invalid CNPJ', () => {
        expect(() => CNPJ.create('12.345.678/0001-00')).toThrowError(InvalidCNPJError);
    });

    it('should throw for CNPJ with wrong length', () => {
        expect(() => CNPJ.create('123456')).toThrowError(InvalidCNPJError);
    });

    it('should return true for equals CNPJs', () => {
        const cnpj1 = CNPJ.create('11.222.333/0001-81');
        const cnpj2 = CNPJ.create('11222333000181');
        expect(cnpj1.equals(cnpj2)).toBe(true);
    })
})