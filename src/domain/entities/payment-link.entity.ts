import type { PaymentLinkDetailsOutputDTO, PaymentLinkOutputDTO } from "@/application/dtos/payment-link.dto.js";
import { PaymentLinkAlreadyUsedError, PaymentLinkAmountMustBePositiveError, PaymentLinkExpiredError } from "../errors/payment-link.error.js";
import { type Currency, Money } from "../value-objects/money.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

export type PaymentLinkStatus = 'ACTIVE' | 'USED' | 'EXPIRED'

interface PaymentLinkProps {
    code: string;
    merchantId: UniqueEntityId;
    amount: Money;
    currency: Currency;
    description: string | null;
    status: PaymentLinkStatus;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

function generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PAY-';
    for(let i = 0; i < 6; i++){
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result;
}

export class PaymentLink extends Entity<PaymentLinkProps>{
    private constructor(props: PaymentLinkProps, id?: UniqueEntityId){
        super(props, id)
    }

    static create(
        props: {
            merchantId: UniqueEntityId,
            amountInCents: number,
            currency?: Currency | undefined,
            description?: string | undefined
        },
        id?: UniqueEntityId
    ): PaymentLink {
        if(props.amountInCents <= 0){
            throw new PaymentLinkAmountMustBePositiveError()
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        return new PaymentLink(
            {
                code: generateCode(),
                merchantId: props.merchantId,
                amount: Money.create(props.amountInCents, props.currency ?? 'BRL'),
                currency: props.currency ?? 'BRL',
                description: props.description?.trim() ?? null,
                status: 'ACTIVE',
                expiresAt,
                usedAt: null,
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    static reconstitute(props: PaymentLinkProps, id: UniqueEntityId): PaymentLink {
        return new PaymentLink(props, id)
    }

    get code(): string { return this._props.code }
    get merchantId(): UniqueEntityId { return this._props.merchantId }
    get amount(): Money { return this._props.amount }
    get currency(): Currency { return this._props.currency }
    get description(): string | null { return this._props.description }
    get status(): PaymentLinkStatus { return this._props.status }
    get expiresAt(): Date { return this._props.expiresAt }
    get usedAt(): Date | null { return this._props.usedAt }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    get isActive(): boolean { return this._props.status === 'ACTIVE' }
    get isUsed(): boolean { return this._props.status === 'USED' }
    get isExpired(): boolean {
        return this._props.status === 'EXPIRED' || new Date() > this._props.expiresAt
    }

    validateForUse(): void {
        if(this.isUsed) throw new PaymentLinkAlreadyUsedError()
        if(this.isExpired) throw new PaymentLinkExpiredError()
    }

    markAsUsed(): void {
        this.validateForUse();
        this._props.status = 'USED';
        this._props.usedAt = new Date();
        this._props.updatedAt = new Date();
    }

    markAsExpired(): void {
        if(this.isUsed) return;
        this._props.status = 'EXPIRED';
        this._props.updatedAt = new Date();
    }

    toOutputDTO(): PaymentLinkOutputDTO {
        return {
            id: this.id.value,
            code: this.code,
            merchantId: this.merchantId.value,
            amountInCents: this.amount.amountInCents,
            amountFormatted: this.amount.formatted,
            currency: this.currency,
            description: this.description,
            status: this.status,
            expiresAt: this.expiresAt,
            usedAt: this.usedAt,
            createdAt: this.createdAt,
        }
    }

    toDetailsDTO(merchantTradeName: string): PaymentLinkDetailsOutputDTO {
        return {
            code: this.code,
            merchantName: merchantTradeName,
            amountInCents: this.amount.amountInCents,
            amountFormatted: this.amount.formatted,
            currency: this.currency,
            description: this.description,
            expiresAt: this.expiresAt
        }
    }
}