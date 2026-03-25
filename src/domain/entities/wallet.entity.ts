import { InsufficientFundsError } from "../errors/insufficient-funds.error.js";
import { type Currency, Money } from "../value-objects/money.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

export type WalletOwnerType = 'MERCHANT' | 'CUSTOMER'

interface WalletProps {
    ownerId: UniqueEntityId;
    ownerType: WalletOwnerType;
    balance: Money;
    currency: Currency;
    createdAt: Date;
    updatedAt: Date;
}

export class Wallet extends Entity<WalletProps>{
    private constructor(props: WalletProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(
        ownerId: UniqueEntityId,
        ownerType: WalletOwnerType,
        currency: Currency = 'BRL',
        id?: UniqueEntityId
    ): Wallet {
        const now = new Date()
        return new Wallet({
            ownerId,
            ownerType,
            balance: Money.zero(currency),
            currency,
            createdAt: now,
            updatedAt: now,
        }, id)
    }

    static reconstitute(props: WalletProps, id: UniqueEntityId): Wallet {
        return new Wallet(props, id);
    }

    get ownerId(): UniqueEntityId {
        return this.props.ownerId;
    }

    get ownerType(): WalletOwnerType {
        return this.props.ownerType;
    }

    get balance(): Money {
        return this.props.balance;
    }

    get currency(): Currency {
        return this.props.currency;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    credit(amount: Money): void {
        this.props.balance = this.props.balance.add(amount);
        this.props.updatedAt = new Date();
    }

    debit(amount: Money): void {
        if(!this.props.balance.isGreaterThanOrEqual(amount)){
            throw new InsufficientFundsError();
        }
        this.props.balance = this.props.balance.subtract(amount);
        this.props.updatedAt = new Date();
    }

    hasEnoughBalance(amount: Money): boolean {
        return this.props.balance.isGreaterThanOrEqual(amount);
    }
}