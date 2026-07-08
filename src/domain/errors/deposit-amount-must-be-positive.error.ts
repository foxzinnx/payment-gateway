import { DomainError } from "./domain.error.js";

export class DepositAmountMustBePositiveError extends DomainError {
    readonly code = 'DEPOSIT_AMOUNT_MUST_BE_POSITIVE'

    constructor(){
        super('Deposit amount must be positive');
    }
}