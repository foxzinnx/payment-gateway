import { DomainError } from "./domain.error.js";

export class InvalidArgumentError extends DomainError {
    readonly code = 'INVALID_ARGUMENT'

    constructor(message: string){
        super(message);
    }
}