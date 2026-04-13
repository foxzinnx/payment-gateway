import { DomainError } from "./domain.error.js";

export class ForbiddenError extends DomainError {
    readonly code = 'FORBIDDEN';

    constructor(message = 'Forbidden'){
        super(message);
    }
}