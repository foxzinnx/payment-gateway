import { DomainError } from "./domain.error.js";

export class RefundAmountMustBePositiveError extends DomainError {
    readonly code = 'REFUND_AMOUNT_MUST_BE_POSITIVE'

    constructor(){
        super('Refund amount must be positive');
    }
}