import { DomainError } from "./domain.error.js";

export class PaymentLinkAmountMustBePositiveError extends DomainError {
    readonly code = 'PAYMENT_LINK_AMOUNT_MUST_BE_POSITIVE'

    constructor(){
        super('Payment link amount must be positive');
    }
}

export class PaymentLinkExpiredError extends DomainError {
  readonly code = 'PAYMENT_LINK_EXPIRED'
  constructor() {
    super('This payment link has expired')
  }
}

export class PaymentLinkAlreadyUsedError extends DomainError {
  readonly code = 'PAYMENT_LINK_ALREADY_USED'
  constructor() {
    super('This payment link has already been used')
  }
}

export class PaymentLinkInvalidError extends DomainError {
  readonly code = 'PAYMENT_LINK_INVALID'
  constructor() {
    super('This payment link is invalid')
  }
}