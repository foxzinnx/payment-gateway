import { DomainError } from "./domain.error.js";

export class TransactionAlreadyRefundedError extends DomainError {
    readonly code = 'TRANSACTION_ALREADY_REFUNDED'

    constructor(){
        super('This transaction has already been refunded');
    }
}