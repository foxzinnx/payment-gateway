import type { Deposit } from "../entities/deposit.entity.js"
import type { PaymentLink } from "../entities/payment-link.entity.js"
import type { Refund } from "../entities/refund.entity.js";
import type { Transaction } from "../entities/transaction.entity.js"
import type { Wallet } from "../entities/wallet.entity.js"

export interface DepositUnitOfWork {
    execute(operations: {
        deposit: Deposit
        wallet: Wallet
    }): Promise<void>;
}

export interface PaymentUnitOfWork {
    execute(operations: {
        transaction: Transaction,
        customerWallet: Wallet,
        merchantWallet: Wallet,
        paymentLink: PaymentLink
    }): Promise<void>;
}
export interface RefundUnitOfWork {
    execute(operations: {
        refund: Refund
        transaction: Transaction
        merchantWallet: Wallet
        customerWallet: Wallet
    }): Promise<void>;
}