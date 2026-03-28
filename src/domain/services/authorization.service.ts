import type { Merchant } from "../entities/merchant.entity.js";
import type { Transaction } from "../entities/transaction.entity.js";
import type { Wallet } from "../entities/wallet.entity.js";

export type AuthorizationResult =
    |   { authorized: true }
    |   { authorized: false; reason: string }

export interface AuthorizationService {
    authorize(transaction: Transaction, customerWallet: Wallet, merchant: Merchant): AuthorizationResult;
}