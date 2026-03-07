import { DomainError } from "./domain.error.js";

export class InvalidCPFError extends DomainError{
    readonly code = 'INVALID_CPF'

    constructor(){
        super('Invalid CPF')
    }
}