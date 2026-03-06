import { InvalidArgumentError } from "../errors/invalid-argument.error.js";

export type Currency = 'BRL' | 'USD' | 'EUR'

interface MoneyProps {
    amountInCents: number;
    currency: Currency;
}

export class Money {
    private readonly props: MoneyProps;

    private constructor(props: MoneyProps){
        this.props = props;
    }

    static create(amountInCents: number, currency: Currency = 'BRL'): Money {
        if(!Number.isInteger(amountInCents)){
            throw new InvalidArgumentError('Amount must be an intenger (in cents)');
        }

        if(amountInCents < 0){
            throw new InvalidArgumentError('Amount cannot be negative')
        }

        return new Money({ amountInCents, currency });
    }

    static zero(currency: Currency = 'BRL'): Money {
        return new Money({ amountInCents: 0, currency });
    }

    get amountInCents(): number {
        return this.props.amountInCents;
    }

    get currency(): Currency {
        return this.props.currency
    }

    get formatted(): string {
        return (this.props.amountInCents / 100).toFixed(2);
    }

    add(other: Money): Money {
        this.ensureSameCurrency(other);
        return new Money({
            amountInCents: this.props.amountInCents + other.amountInCents,
            currency: this.props.currency
        });
    }

    subtract(other: Money): Money {
        this.ensureSameCurrency(other);
        return new Money({
            amountInCents: this.props.amountInCents - other.amountInCents,
            currency: this.props.currency
        });
    }

    isGreaterThanOrEqual(other: Money): boolean {
        this.ensureSameCurrency(other);
        return this.props.amountInCents >= other.amountInCents
    }

    isZero(): boolean {
        return this.props.amountInCents === 0;
    }

    equals(other: Money): boolean {
        return (
            this.props.amountInCents === other.amountInCents && 
            this.props.currency === other.currency
        )
    }

    private ensureSameCurrency(other: Money): void {
        if(this.props.currency != other.props.currency){
            throw new InvalidArgumentError(`Currency mismatch: ${this.props.currency} vs ${other.props.currency}`)
        }
    }
}