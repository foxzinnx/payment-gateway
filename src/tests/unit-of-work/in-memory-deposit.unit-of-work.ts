import type { Deposit } from "@/domain/entities/deposit.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { DepositUnitOfWork } from "@/domain/repositories/unit-of-work.js";

export class InMemoryDepositUnitOfWork implements DepositUnitOfWork {
    public deposits: Deposit[] = [];
    public wallets: Wallet[] = [];
    
    async execute(operations: { deposit: Deposit; wallet: Wallet; }): Promise<void> {
        this.deposits.push(operations.deposit);

        const index = this.wallets.findIndex((w) => w.id.equals(operations.wallet.id));
        if(index > 0) {
            this.wallets[index] = operations.wallet;
        }
    }
}