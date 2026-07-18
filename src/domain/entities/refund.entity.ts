import type { RefundOutputDTO } from "@/application/dtos/refund.dto.js";
import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { RefundAmountMustBePositiveError } from "../errors/refund-amount-must-be-positive.error.js";
import { Money, type Currency } from "../value-objects/money.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js"
import { Entity } from "./base/entity.base.js";

export type RefundStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

interface RefundProps {
    transactionId: UniqueEntityId;
    merchantId: UniqueEntityId;
    customerId: UniqueEntityId;
    amount: Money;
    currency: Currency;
    reason: string | null;
    status: RefundStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Refund extends Entity<RefundProps>{
    private constructor(props: RefundProps, id?: UniqueEntityId){
        super(props, id)
    }

    static create(
        props:{
            transactionId: UniqueEntityId;
            merchantId: UniqueEntityId;
            customerId: UniqueEntityId;
            amountInCents: number;
            currency: Currency;
            reason?: string | undefined;
        },
        id?: UniqueEntityId
    ){
        if(props.amountInCents <= 0){
            throw new RefundAmountMustBePositiveError()
        }
        const now = new Date();

        return new Refund(
            {
                transactionId: props.transactionId,
                merchantId: props.merchantId,
                customerId: props.customerId,
                amount: Money.create(props.amountInCents, props.currency),
                currency: props.currency,
                reason: props.reason?.trim() ?? null,
                status: 'PENDING',
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }
    
    static reconstitute(props: RefundProps, id: UniqueEntityId): Refund {
        return new Refund(props, id);
    }

    get transactionId(): UniqueEntityId { return this._props.transactionId }
    get merchantId(): UniqueEntityId { return this._props.merchantId }
    get customerId(): UniqueEntityId { return this._props.customerId }
    get amount(): Money { return this._props.amount }
    get currency(): Currency { return this._props.currency }
    get reason(): string | null { return this._props.reason }
    get status(): RefundStatus { return this._props.status }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    get isCompleted(): boolean { return this._props.status === 'COMPLETED' }
    get isPending(): boolean { return this._props.status === 'PENDING' }

    complete(): void {
        if(!this.isPending){
            throw new InvalidArgumentError('Only pending refunds can be completed')
        }
        this._props.status = 'COMPLETED';
        this._props.updatedAt = new Date();
    }

    toOutputDTO(): RefundOutputDTO {
        return {
            id: this.id.value,
            transactionId: this._props.transactionId.value,
            merchantId: this._props.merchantId.value,
            customerId: this._props.customerId.value,
            amountInCents: this._props.amount.amountInCents,
            amountFormatted: this._props.amount.formatted,
            currency: this._props.currency,
            reason: this._props.reason,
            status: this._props.status,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt
        }
    }
}