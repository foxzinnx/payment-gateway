import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { TransactionAmountMustBePositiveError } from "../errors/transaction-amount-must-be-positive.error.js";
import { Money, type Currency } from "../value-objects/money.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js"
import { Entity } from "./base/entity.base.js";

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'FAILED'

interface TransactionProps {
    customerId: UniqueEntityId;
    merchantId: UniqueEntityId;
    amount: Money;
    currency: Currency;
    status: TransactionStatus;
    description: string | null;
    idempotencyKey: string | null;
    denialReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Transaction extends Entity<TransactionProps>{
    private constructor(props: TransactionProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(
        props: {
            customerId: UniqueEntityId
            merchantId: UniqueEntityId
            amountInCents: number
            currency?: Currency
            description?: string
            idempotencyKey?: string
        },
        id?: UniqueEntityId
    ): Transaction {
        if(props.amountInCents <= 0){
            throw new TransactionAmountMustBePositiveError();
        }

        const now = new Date();

        return new Transaction(
            {
                customerId: props.customerId,
                merchantId: props.merchantId,
                amount: Money.create(props.amountInCents, props.currency ?? 'BRL'),
                currency: props.currency ?? 'BRL',
                status: 'PENDING',
                description: props.description?.trim() ?? null,
                idempotencyKey: props.idempotencyKey ?? null,
                denialReason: null,
                createdAt: now,
                updatedAt: now
            },
            id
        );
    }

    static reconstitute(props: TransactionProps, id: UniqueEntityId): Transaction {
        return new Transaction(props, id);
    }

    get customerId(): UniqueEntityId { return this._props.customerId }
    get merchantId(): UniqueEntityId { return this._props.merchantId }
    get amount(): Money { return this._props.amount }
    get currency(): Currency { return this._props.currency }
    get status(): TransactionStatus { return this._props.status }
    get description(): string | null { return this._props.description }
    get idempotencyKey(): string | null { return this._props.idempotencyKey }
    get denialReason(): string | null { return this._props.denialReason }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    get isPending(): boolean { return this._props.status === 'PENDING' }
    get isApproved(): boolean { return this._props.status === 'APPROVED' }
    get isFailed(): boolean { return this._props.status === 'FAILED' }

    approve(): void {
        if(!this.isPending){
            throw new InvalidArgumentError('Only pending transactions can be approved')
        }

        this._props.status = 'APPROVED';
        this._props.updatedAt = new Date();
    }

    fail(reason: string): void {
        if(!this.isPending){
            throw new InvalidArgumentError('Only pending transaction can be failed');
        }
        this._props.status = 'FAILED';
        this._props.updatedAt = new Date();
    }
}