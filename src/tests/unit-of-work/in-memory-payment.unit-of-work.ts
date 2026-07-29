import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { PaymentUnitOfWork } from "@/domain/repositories/unit-of-work.js";

export class InMemoryPaymentUnitOfWork implements PaymentUnitOfWork {
    public transactions: Transaction[] = [];
    public wallets: Wallet[] = [];
    
    async execute(operations: { transaction: Transaction; customerWallet: Wallet; merchantWallet: Wallet; }): Promise<void> {
        this.transactions.push(operations.transaction);

        for(const wallet of [operations.customerWallet, operations.merchantWallet]){
            const index = this.wallets.findIndex((w) => w.id.equals(wallet.id));
            if(index > 0){
                this.wallets[index] = wallet;
            }
        }
    }

}