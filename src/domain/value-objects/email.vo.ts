import { InvalidArgumentError } from "../errors/invalid-argument.error.js";

export class Email{
    private readonly _value: string;

    private constructor(value: string){
        this._value = value;
    }

    static create(value: string): Email {
        const trimmed = value.trim().toLowerCase();
        if(!Email.isValid(trimmed)){
            throw new InvalidArgumentError('Invalid email');
        }

        return new Email(trimmed);
    }

    private static isValid(value: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(value);
    }

    get value(): string {
        return this._value;
    }

    equals(other: Email): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value;
    }
}