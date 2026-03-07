import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { InvalidCPFError } from "../errors/invalid-cpf.error.js";

export class CPF {
    private readonly _value: string;

    private constructor(value: string){
        this._value = value;
    }

    static create(value: string): CPF {
        const digits = CPF.strip(value);

        if(!CPF.isValid(digits)){
            throw new InvalidCPFError();
        }

        return new CPF(digits);
    }

    private static strip(value: string): string {
        return value.replace(/\D/g, '');
    }

    private static isValid(digits: string): boolean {
        if(digits.length !== 11) return false

        if(/^(\d)\1{10}$/.test(digits)) return false

        let sum = 0;
        for(let i = 0; i < 9; i++){
            sum += parseInt(digits[i]!) * (10 - i)
        }

        let remainder = (sum * 10) % 11
        if(remainder === 10 || remainder === 11) remainder = 0
        if(remainder !== parseInt(digits[9]!)) return false

        sum = 0;
        for(let i = 0; i < 10; i++){
            sum += parseInt(digits[i]!) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if(remainder === 10 || remainder === 11) remainder = 0;
        if(remainder !== parseInt(digits[10]!)) return false

        return true;
    }

    get value(): string {
        return this._value;
    }

    get formatted(): string {
        return this._value.replace(
            /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
            '$1.$2.$3-$4'
        )
    }

    equals(other: CPF): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}