import type { WalletOwnerType } from "../../domain/entities/wallet.entity.js";
import type { Currency } from "../../domain/value-objects/money.vo.js";

export interface CreateWalletInputDTO {
    ownerId: string;
    ownerType: WalletOwnerType;
    currency?: Currency;
}

export interface CreditWalletInputDTO {
    walletId: string;
    amountInCents: number;
}

export interface DebitWalletInputDTO {
    walletId: string;
    amountInCents: number;
}

export interface WalletOutputDTO {
    id: string;
    ownerId: string;
    ownerType: WalletOwnerType;
    balanceInCents: number;
    balanceFormatted: string;
    currency: Currency;
    createdAt: Date;
    updatedAt: Date;
}