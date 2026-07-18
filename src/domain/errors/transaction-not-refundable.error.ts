import { DomainError } from "./domain.error.js"

export class TransactionNotRefundableError extends DomainError {
    readonly code = 'TRANSACTION_NOT_REFUNDABLE'
    constructor() {
        super('Only approved transactions can be refunded')
    }
}