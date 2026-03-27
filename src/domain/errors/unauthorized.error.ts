import { DomainError } from "./domain.error.js";

export class UnauthorizedError extends DomainError {
    readonly code = 'UNAUTHORIZED';

    constructor(message = 'Unauthorized'){
        super(message);
    }
}