import { DomainError } from "./domain.error.js";

export class NotFoundError extends DomainError{
    readonly code = 'NOT_FOUND'

    constructor(resource: string){
        super(`${resource} not found`);
    }
}