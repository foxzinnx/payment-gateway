import { CreateRefundUseCase } from "@/application/use-cases/refund/create-refund.use-case.js";
import { Transaction } from "@/domain/entities/transaction.entity.js";
import { Wallet } from "@/domain/entities/wallet.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { TransactionAlreadyRefundedError } from "@/domain/errors/transaction-already-refunded.error.js";
import { TransactionNotRefundableError } from "@/domain/errors/transaction-not-refundable.error.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import { Money } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { InMemoryRefundRepository } from "@/tests/repositories/in-memory-refund.repository.js";
import { InMemoryTransactionRepository } from "@/tests/repositories/in-memory-transaction.repository.js";
import { InMemoryWalletRepository } from "@/tests/repositories/in-memory-wallet.repository.js";
import { InMemoryWebhookPublisher } from "@/tests/services/in-memory-webhook-publisher.js";
import { InMemoryRefundUnitOfWork } from "@/tests/unit-of-work/in-memory-refund.unit-of-work.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('CreateRefundUseCase', () => {
    let refundRepository: InMemoryRefundRepository;
    let transactionRepository: InMemoryTransactionRepository;
    let walletRepository: InMemoryWalletRepository;
    let refundUnitOfWork: InMemoryRefundUnitOfWork;
    let webhookPublisher: InMemoryWebhookPublisher;
    let sut: CreateRefundUseCase;

    let customerId: UniqueEntityId;
    let merchantId: UniqueEntityId;
    let customerWallet: Wallet;
    let merchantWallet: Wallet;
    let transaction: Transaction;

    beforeEach(async () => {
        refundRepository = new InMemoryRefundRepository()
        transactionRepository = new InMemoryTransactionRepository()
        walletRepository = new InMemoryWalletRepository()
        refundUnitOfWork = new InMemoryRefundUnitOfWork()
        webhookPublisher = new InMemoryWebhookPublisher()

        sut = new CreateRefundUseCase(
        refundRepository,
        transactionRepository,
        walletRepository,
        refundUnitOfWork,
        webhookPublisher
        )

        customerId = new UniqueEntityId()
        merchantId = new UniqueEntityId()

        customerWallet = Wallet.create(customerId, 'CUSTOMER', 'BRL')
        await walletRepository.save(customerWallet)
        refundUnitOfWork.wallets.push(customerWallet)

        merchantWallet = Wallet.create(merchantId, 'MERCHANT', 'BRL')
        merchantWallet.credit(Money.create(10000, 'BRL'))
        await walletRepository.save(merchantWallet)
        refundUnitOfWork.wallets.push(merchantWallet)

        transaction = Transaction.create({
        customerId,
        merchantId,
        amountInCents: 5000,
        currency: 'BRL',
        })
        transaction.approve()
        await transactionRepository.save(transaction)
        refundUnitOfWork.transactions.push(transaction)
    })

    describe('successful refund', () => {
        it('should create a completed refund', async () => {
            const output = await sut.execute(
                merchantId.value,
                transaction.id.value,
                { reason: 'Product out of stock' }
            );

            expect(output.status).toBe('COMPLETED');
            expect(output.amountInCents).toBe(5000);
            expect(output.amountFormatted).toBe('50.00');
            expect(output.reason).toBe('Product out of stock');
            expect(output.transactionId).toBe(transaction.id.value);
        });

        it('should debit merchant and credit customer wallets', async () => {
            await sut.execute(merchantId.value, transaction.id.value, {});

            const updatedMerchantWallet = refundUnitOfWork.wallets.find(
                (w) => w.ownerId.equals(merchantId)
            );
            const updatedCustomerWallet = refundUnitOfWork.wallets.find(
                (w) => w.ownerId.equals(customerId)
            );

            expect(updatedMerchantWallet!.balance.amountInCents).toBe(5000);
            expect(updatedCustomerWallet!.balance.amountInCents).toBe(5000);
        })

        it('should mark transaction as REFUNDED', async () => {
            await sut.execute(merchantId.value, transaction.id.value, {});

            const refundedTransaction = refundUnitOfWork.transactions.find(
                (t) => t.id.equals(transaction.id)
            );

            expect(refundedTransaction!.status).toBe('REFUNDED');
            expect(refundedTransaction!.isRefunded).toBe(true);
        });

        it('should create refund without reason', async () => {
            const output = await sut.execute(
                merchantId.value,
                transaction.id.value,
                {}
            );

            expect(output.reason).toBeNull();
        });

        it('should persist refund via unit of work', async () => {
            await sut.execute(merchantId.value, transaction.id.value, {});

            expect(refundUnitOfWork.refunds).toHaveLength(1);
            expect(refundUnitOfWork.refunds[0]?.status).toBe('COMPLETED');
        });
    });

    describe('webhook', () => {
        it('should dispatch transaction.refunded webhook', async () => {
            await sut.execute(merchantId.value, transaction.id.value, {});

            expect(
                webhookPublisher.wasPublished(WEBHOOK_EVENTS.TRANSACTION_REFUNDED)
            ).toBe(true);
        });

        it('should dispatch webhook with correct merchantId', async () => {
            await sut.execute(merchantId.value, transaction.id.value, {});

            const lastCall = webhookPublisher.lastCall();
            expect(lastCall?.merchantId).toBe(merchantId.value);
        })
    })

    describe('authorization errors', () => {
        it('should throw UnauthorizedError when merchant is not owner of transaction', async () => {
            const otherMerchantId = new UniqueEntityId().value;

            await expect(
                sut.execute(otherMerchantId, transaction.id.value, {})
            ).rejects.toThrowError(UnauthorizedError);
        });
    });

    describe('business rule errors', () => {
        it('should throw TransactionNotRefundableError for pending transaction', async () => {
            const pendingTransaction = Transaction.create({
                customerId,
                merchantId,
                amountInCents: 5000,
                currency: 'BRL',
            });
            await transactionRepository.save(pendingTransaction);

            await expect(
                sut.execute(merchantId.value, pendingTransaction.id.value, {})
            ).rejects.toThrowError(TransactionNotRefundableError);
        });

        it('should throw TransactionNotRefundableError for failed transaction', async () => {
            const failedTransaction = Transaction.create({
                customerId,
                merchantId,
                amountInCents: 5000,
                currency: 'BRL',
            });
            failedTransaction.fail('Insufficient funds');
            await transactionRepository.save(failedTransaction);

            await expect(
                sut.execute(merchantId.value, failedTransaction.id.value, {})
            ).rejects.toThrowError(TransactionNotRefundableError);
        });

        it('should throw TransactionAlreadyRefundedError when refund already exists', async () => {
            await sut.execute(merchantId.value, transaction.id.value, {})

            await expect(
                sut.execute(merchantId.value, transaction.id.value, {})
            ).rejects.toThrowError(TransactionAlreadyRefundedError);
        });
    });

    describe('not found errors', () => {
        it('should throw NotFoundError when transaction does not exist', async () => {
            await expect(
                sut.execute(
                merchantId.value,
                '00000000-0000-0000-0000-000000000000',
                {}
                )
            ).rejects.toThrowError(NotFoundError);
        });

        it('should throw NotFoundError when merchant wallet does not exist', async () => {
            const merchantWithoutWallet = new UniqueEntityId();

            const transactionForMerchant = Transaction.create({
                customerId,
                merchantId: merchantWithoutWallet,
                amountInCents: 5000,
                currency: 'BRL',
            });
            transactionForMerchant.approve();
            await transactionRepository.save(transactionForMerchant);

            await expect(
                sut.execute(
                merchantWithoutWallet.value,
                transactionForMerchant.id.value,
                {}
                )
            ).rejects.toThrowError(NotFoundError);
        });

        it('should throw NotFoundError when customer wallet does not exist', async () => {
            const customerWithoutWallet = new UniqueEntityId();

            const transactionNoWallet = Transaction.create({
                customerId: customerWithoutWallet,
                merchantId,
                amountInCents: 5000,
                currency: 'BRL',
            });
            transactionNoWallet.approve();
            await transactionRepository.save(transactionNoWallet);

            await expect(
                sut.execute(merchantId.value, transactionNoWallet.id.value, {})
            ).rejects.toThrowError(NotFoundError);
        });
    });
})