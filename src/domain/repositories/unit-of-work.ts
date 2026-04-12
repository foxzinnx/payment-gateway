import type { PaymentLink } from "../entities/payment-link.entity.js"
import type { Transaction } from "../entities/transaction.entity.js"
import type { Wallet } from "../entities/wallet.entity.js"

export interface PaymentUnitOfWork {
    execute(operations: {
        transaction: Transaction,
        customerWallet: Wallet,
        merchantWallet: Wallet,
        paymentLink: PaymentLink
    }): Promise<void>;
}