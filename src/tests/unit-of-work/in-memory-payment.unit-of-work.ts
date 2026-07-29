import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { PaymentUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";

export class InMemoryPaymentUnitOfWork implements PaymentUnitOfWork {
    public transactions: Transaction[] = [];
    public wallets: Wallet[] = [];

    constructor(
        private transactionRepository: TransactionRepository,
        private walletRepository: WalletRepository
    ) {}
    
    async execute(operations: { transaction: Transaction; customerWallet: Wallet; merchantWallet: Wallet; }): Promise<void> {
        await this.transactionRepository.save(operations.transaction);
        await this.walletRepository.update(operations.customerWallet);
        await this.walletRepository.update(operations.merchantWallet);

        this.transactions.push(operations.transaction);

        for(const wallet of [operations.customerWallet, operations.merchantWallet]){
            const index = this.wallets.findIndex((w) => w.id.equals(wallet.id));
            if(index >= 0){ 
                this.wallets[index] = wallet;
            } else {
                this.wallets.push(wallet);
            }
        }
    }
}