import { InvalidCNPJError } from "../errors/invalid-cnpj.error.js";

export class CNPJ {
    private readonly _value: string;

    private constructor(value: string){
        this._value = value;
    }

    static create(value: string): CNPJ{
        const digits = CNPJ.strip(value);

        if(!CNPJ.isValid(digits)){
            throw new InvalidCNPJError();
        }

        return new CNPJ(digits);
    }

    private static strip(value: string): string {
        return value.replace(/\D/g, '');
    }

    private static isValid(digits: string): boolean {
        if(digits.length !== 14) return false

        if(/^(\d)\1{13}$/.test(digits)) return false;

        const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
        let sum = 0;
        for(let i = 0; i < 12; i++){
            sum += parseInt(digits[i]!) * weights1[i]!
        }

        let remainder = sum % 11
        const first = remainder < 2 ? 0 : 11 - remainder
        if(first !== parseInt(digits[12]!)) return false;

        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        sum = 0;
        for(let i = 0; i < 13; i++){
            sum += parseInt(digits[i]!) * weights2[i]!
        }

        remainder = sum % 11
        const second = remainder < 2 ? 0 : 11 - remainder;
        if(second !== parseInt(digits[13]!)) return false;
        
        return true;
    }

    get value(): string {
        return this._value;
    }

    get formatted(): string {
        return this._value.replace(
            /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
            '$1.$2.$3/$4-$5'
        )
    }

    equals(other: CNPJ): boolean {
        return this._value === other._value;
    }

    toString(): string{
        return this._value;
    }
}