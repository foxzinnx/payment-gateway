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
        return this._props.ownerId;
    }

    get ownerType(): WalletOwnerType {
        return this._props.ownerType;
    }

    get balance(): Money {
        return this._props.balance;
    }

    get currency(): Currency {
        return this._props.currency;
    }

    get createdAt(): Date {
        return this._props.createdAt;
    }

    get updatedAt(): Date {
        return this._props.updatedAt;
    }

    credit(amount: Money): void {
        this._props.balance = this._props.balance.add(amount);
        this._props.updatedAt = new Date();
    }

    debit(amount: Money): void {
        if(!this._props.balance.isGreaterThanOrEqual(amount)){
            throw new InsufficientFundsError();
        }
        this._props.balance = this._props.balance.subtract(amount);
        this._props.updatedAt = new Date();
    }

    hasEnoughBalance(amount: Money): boolean {
        return this._props.balance.isGreaterThanOrEqual(amount);
    }
}