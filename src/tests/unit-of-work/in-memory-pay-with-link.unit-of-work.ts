import type { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { PayWithLinkUnitOfWork } from "@/domain/repositories/unit-of-work.js";

export class InMemoryPayWithLinkUnitOfWork implements PayWithLinkUnitOfWork {
    public transactions: Transaction[] = [];
    public wallets: Wallet[] = [];
    public paymentLinks: PaymentLink[] = [];
    
    async execute(operations: { transaction: Transaction; customerWallet: Wallet; merchantWallet: Wallet; paymentLink: PaymentLink; }): Promise<void> {
        this.transactions.push(operations.transaction);
        this.paymentLinks.push(operations.paymentLink);
        
        for(const wallet of [operations.customerWallet, operations.merchantWallet]){
            const index = this.wallets.findIndex((w) => w.id.equals(wallet.id));
            if(index > 0){
                this.wallets[index] = wallet; 
            }
        }
    }
}