import { DomainError } from "./domain.error.js";

export class EmailAlreadyInUseError extends DomainError {
    readonly code = 'EMAIL_ALREADY_IN_USE'

    constructor(){
        super('Email already in use');
    }
}