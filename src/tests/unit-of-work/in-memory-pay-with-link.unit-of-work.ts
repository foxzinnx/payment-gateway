import type { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import type { Transaction } from "@/domain/entities/transaction.entity.js";
import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { PaymentLinkRepository } from "@/domain/repositories/payment-link.repository.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import type { PayWithLinkUnitOfWork } from "@/domain/repositories/unit-of-work.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";

export class InMemoryPayWithLinkUnitOfWork implements PayWithLinkUnitOfWork {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private walletRepository: WalletRepository,
        private readonly paymentLinkRepository: PaymentLinkRepository
    ){};

    async execute(operations: { transaction: Transaction; customerWallet: Wallet; merchantWallet: Wallet; paymentLink: PaymentLink; }): Promise<void> {
        await this.transactionRepository.save(operations.transaction);
        await this.paymentLinkRepository.update(operations.paymentLink);
        await this.walletRepository.update(operations.customerWallet);
        await this.walletRepository.update(operations.merchantWallet);
    }
}