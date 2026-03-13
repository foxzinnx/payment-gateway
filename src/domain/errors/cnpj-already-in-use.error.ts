import { DomainError } from "./domain.error.js";

export class CNPJAlreadyInUse extends DomainError {
    readonly code = 'CNPJ_ALREADY_IN_USE'

    constructor(){
        super('CNPJ already in use');
    }
}