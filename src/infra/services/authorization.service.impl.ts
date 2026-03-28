import type { Merchant } from "@/domain/entities/merchant.entity.js";
import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { AuthorizationResult, AuthorizationService } from "@/domain/services/authorization.service.js";

const MAX_TRANSACTION_AMOUNT_IN_CENTS = 1_000_000

export class AuthorizationServiceImpl implements AuthorizationService {
    authorize(transaction: Transaction, customerWallet: Wallet, merchant: Merchant): AuthorizationResult {
        if(!merchant.isActive){
            return {
                authorized: false,
                reason: 'Merchant is not active'
            }
        }

        if(!customerWallet.hasEnoughBalance(transaction.amount)){
            return {
                authorized: false,
                reason: 'Insufficient funds'
            }
        }

        if(transaction.amount.amountInCents > MAX_TRANSACTION_AMOUNT_IN_CENTS){
            return { 
                authorized: false,
                reason: `Transaction amount exceeds the limit of R$${(MAX_TRANSACTION_AMOUNT_IN_CENTS / 100).toFixed(2)}`
            }
        }

        if(transaction.amount.amountInCents < 100){
            return {
                authorized: false,
                reason: 'Transaction amount is below the minimum of R$ 1.00'
            }
        }

        return { authorized: true }
    }
}

export const authorizationService = new AuthorizationServiceImpl();