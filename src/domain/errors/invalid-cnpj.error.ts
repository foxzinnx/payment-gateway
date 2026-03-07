import { DomainError } from "./domain.error.js";

export class InvalidCNPJError extends DomainError {
    readonly code = 'INVALID_CNPJ'

    constructor(){
        super('Invalid CNPJ')
    }
}