import type { RefundStatus } from "@/domain/entities/refund.entity.js"
import type { Currency } from "@/domain/value-objects/money.vo.js"

export interface CreateRefundInputDTO {
    reason?: string | undefined
}

export interface RefundOutputDTO {
    id: string
    transactionId: string
    merchantId: string
    customerId: string
    amountInCents: number
    amountFormatted: string
    currency: Currency
    reason: string | null
    status: RefundStatus
    createdAt: Date
    updatedAt: Date
}