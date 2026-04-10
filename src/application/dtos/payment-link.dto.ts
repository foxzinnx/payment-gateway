import type { PaymentLinkStatus } from "@/domain/entities/payment-link.entity.js";
import type { Currency } from "@/domain/value-objects/money.vo.js";

export interface CreatePaymentLinkInputDTO {
    amountInCents: number;
    currency?: Currency | undefined;
    description?: string | undefined;
}

export interface PaymentLinkOutputDTO{
    id: string;
    code: string;
    merchantId: string;
    amountInCents: number;
    amountFormatted: string;
    currency: Currency;
    description: string | null;
    status: PaymentLinkStatus;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
}

export interface PaymentLinkDetailsOutputDTO{
    code: string;
    merchantName: string;
    amountInCents: number;
    amountFormatted: string;
    currency: Currency;
    description: string | null;
    expiresAt: Date;
}