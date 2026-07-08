import type { DepositOutputDTO } from "@/application/dtos/deposit.dto.js";
import { DepositAmountMustBePositiveError } from "../errors/deposit-amount-must-be-positive.error.js";
import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { Money, type Currency } from "../value-objects/money.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

export type DepositStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
export type DepositMethod = 'PIX' | 'TED' | 'BOLETO'

interface DepositProps {
    customerId: UniqueEntityId;
    walletId: UniqueEntityId;
    amount: Money;
    currency: Currency;
    status: DepositStatus;
    method: DepositMethod;
    createdAt: Date;
    updatedAt: Date;
}

export class Deposit extends Entity<DepositProps>{
    private constructor(props: DepositProps, id?: UniqueEntityId){
        super(props, id)
    }

    static create(
        props: {
            customerId: UniqueEntityId;
            walletId: UniqueEntityId;
            amountInCents: number;
            currency?: Currency | undefined;
            method?: DepositMethod |undefined
        },
        id?: UniqueEntityId
    ): Deposit {
        if(props.amountInCents <= 0){
            throw new DepositAmountMustBePositiveError()
        }

        const now = new Date();

        return new Deposit(
            {
                customerId: props.customerId,
                walletId: props.walletId,
                amount: Money.create(props.amountInCents, props.currency ?? 'BRL'),
                currency: props.currency ?? 'BRL',
                status: 'PENDING',
                method: props.method ?? "PIX",
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    static reconstitute(props: DepositProps, id: UniqueEntityId): Deposit {
        return new Deposit(props, id)
    }

    get customerId(): UniqueEntityId { return this._props.customerId }
    get walletId(): UniqueEntityId { return this._props.walletId }
    get amount(): Money { return this._props.amount }
    get currency(): Currency { return this._props.currency }
    get status(): DepositStatus { return this._props.status }
    get method(): DepositMethod { return this._props.method }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    get isCompleted(): boolean { return this._props.status === 'COMPLETED' }
    get isPending(): boolean { return this._props.status === 'PENDING' }
    get isFailed(): boolean { return this._props.status === 'FAILED' }

    complete(): void {
        if(!this.isPending){
            throw new InvalidArgumentError('Only pending deposits can be completed')
        }
        this._props.status = 'COMPLETED'
        this._props.updatedAt = new Date()
    }

    fail(): void {
        if(!this.isPending){
            throw new InvalidArgumentError('Only pending deposits can be failed')
        }
        this._props.status = 'FAILED';
        this._props.updatedAt = new Date()
    }

    toOutputDTO(): DepositOutputDTO {
        return {
            id: this.id.value,
            customerId: this._props.customerId.value,
            walletId: this._props.walletId.value,
            amountInCents: this._props.amount.amountInCents,
            amountFormatted: this._props.amount.formatted,
            currency: this._props.currency,
            status: this._props.status,
            method: this._props.method,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt
        }
    }
}