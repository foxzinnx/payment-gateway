import { DomainError } from "./domain.error.js";

export class CPFAlreadyInUseError extends DomainError {
    readonly code = 'CPF_ALREADY_IN_USE'

    constructor(){
        super('CPF already in use');
    }
}