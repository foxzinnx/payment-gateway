import type { TransactionStatus } from "@/domain/entities/transaction.entity.js";
import type { Currency } from "@/domain/value-objects/money.vo.js";

export interface CreateTransactionInputDTO {
    merchantId: string;
    amountInCents: number;
    currency?: Currency;
    description?: string;
    idempotencyKey?: string;
}

export interface TransactionOutputDTO {
  id: string
  customerId: string
  merchantId: string
  amountInCents: number
  amountFormatted: string
  currency: Currency
  status: TransactionStatus
  description: string | null
  denialReason: string | null
  createdAt: Date
  updatedAt: Date
}