import { DomainError } from "./domain.error.js";

export class InsufficientFundsError extends DomainError{
    readonly code = 'INSUFFICIENT_FUNDS'

    constructor(){
        super('Insufficient funds to complete this operation');
    }
}