import type { DepositMethod, DepositStatus } from "@/domain/entities/deposit.entity.js";
import type { Currency } from "@/domain/value-objects/money.vo.js";

export interface CreateDepositInputDTO {
    amountInCents: number;
    currency?: Currency | undefined;
    method?: DepositMethod | undefined;
}

export interface DepositOutputDTO {
    id: string;
    customerId: string;
    walletId: string;
    amountInCents: number;
    amountFormatted: string;
    currency: Currency;
    status: DepositStatus;
    method: DepositMethod;
    createdAt: Date;
    updatedAt: Date;
}