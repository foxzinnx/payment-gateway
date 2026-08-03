import type { Refund } from "@/domain/entities/refund.entity.js";
import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { RefundUnitOfWork } from "@/domain/repositories/unit-of-work.js";

export class InMemoryRefundUnitOfWork implements RefundUnitOfWork {
    public refunds: Refund[] = [];
    public transactions: Transaction[] = [];
    public wallets: Wallet[] = [];
    
    async execute(operations: { refund: Refund; transaction: Transaction; merchantWallet: Wallet; customerWallet: Wallet; }): Promise<void> {
        this.refunds.push(operations.refund);
        this.transactions.push(operations.transaction);

        for(const wallet of [operations.customerWallet, operations.merchantWallet]){
            const index = this.wallets.findIndex((w) => w.id.equals(wallet.id));
            if(index >= 0){
                this.wallets[index] = wallet;
            }
        }
    }
}