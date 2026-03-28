import { DomainError } from "./domain.error.js";

export class TransactionAmountMustBePositiveError extends DomainError {
    readonly code = 'TRANSACTION_AMOUNT_MUST_BE_POSITIVE'

    constructor(){
        super('Transaction amount must be positive');
    }
}