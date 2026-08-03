import { PayWithLinkUseCase } from "@/application/use-cases/payment-link/pay-with-link.use-case.js";
import { Customer } from "@/domain/entities/customer.entity.js";
import { Merchant } from "@/domain/entities/merchant.entity.js";
import { PaymentLink } from "@/domain/entities/payment-link.entity.js";
import { Wallet } from "@/domain/entities/wallet.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { PaymentLinkAlreadyUsedError, PaymentLinkExpiredError } from "@/domain/errors/payment-link.error.js";
import { Money } from "@/domain/value-objects/money.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { AuthorizationServiceImpl } from "@/infra/services/authorization.service.impl.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { InMemoryMerchantRepository } from "@/tests/repositories/in-memory-merchant.repository.js";
import { InMemoryPaymentLinkRepository } from "@/tests/repositories/in-memory-payment-link.repository.js";
import { InMemoryTransactionRepository } from "@/tests/repositories/in-memory-transaction.repository.js";
import { InMemoryWalletRepository } from "@/tests/repositories/in-memory-wallet.repository.js";
import { InMemoryWebhookPublisher } from "@/tests/services/in-memory-webhook-publisher.js";
import { InMemoryPayWithLinkUnitOfWork } from "@/tests/unit-of-work/in-memory-pay-with-link.unit-of-work.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe('PayWithLinkUseCase', () => {
    let paymentLinkRepository: InMemoryPaymentLinkRepository
    let transactionRepository: InMemoryTransactionRepository
    let customerRepository: InMemoryCustomerRepository
    let merchantRepository: InMemoryMerchantRepository
    let walletRepository: InMemoryWalletRepository
    let payWithLinkUnitOfWork: InMemoryPayWithLinkUnitOfWork
    let webhookPublisher: InMemoryWebhookPublisher
    let authorizationService: AuthorizationServiceImpl
    let sut: PayWithLinkUseCase

    let customer: Customer
    let merchant: Merchant
    let customerWallet: Wallet
    let merchantWallet: Wallet
    let paymentLink: PaymentLink

    beforeEach(async () => {
        paymentLinkRepository = new InMemoryPaymentLinkRepository()
        transactionRepository = new InMemoryTransactionRepository()
        customerRepository = new InMemoryCustomerRepository()
        merchantRepository = new InMemoryMerchantRepository()
        walletRepository = new InMemoryWalletRepository()
        payWithLinkUnitOfWork = new InMemoryPayWithLinkUnitOfWork(
            transactionRepository,
            walletRepository,
            paymentLinkRepository
        )
        webhookPublisher = new InMemoryWebhookPublisher()
        authorizationService = new AuthorizationServiceImpl()

        sut = new PayWithLinkUseCase(
            paymentLinkRepository,
            customerRepository,
            merchantRepository,
            walletRepository,
            transactionRepository,
            authorizationService,
            payWithLinkUnitOfWork,
            webhookPublisher
        )

        customer = await Customer.create({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25',
            password: 'senha123',
        });
        await customerRepository.save(customer);

        customerWallet = Wallet.create(customer.id, 'CUSTOMER', 'BRL');
        customerWallet.credit(Money.create(20000, 'BRL'));
        await walletRepository.save(customerWallet);

        merchant = await Merchant.create({
            name: 'Empresa Exemplo LTDA',
            tradeName: 'Exemplo Store',
            email: 'contato@exemplo.com',
            cnpj: '11.222.333/0001-81',
            password: 'senha123',
        });
        await merchantRepository.save(merchant);

        merchantWallet = Wallet.create(merchant.id, 'MERCHANT', 'BRL');
        await walletRepository.save(merchantWallet);

        paymentLink = PaymentLink.create({
            merchantId: merchant.id,
            amountInCents: 5000,
            currency: 'BRL',
            description: 'Produto X',
        });
        await paymentLinkRepository.save(paymentLink);
    });

    describe('approved payment', () => {
        it('should pay with link and return approved transaction', async () => {
            const output = await sut.execute(customer.id.value, {
                code: paymentLink.code,
            });

            expect(output.status).toBe('APPROVED');
            expect(output.amountInCents).toBe(5000);
            expect(output.amountFormatted).toBe('50.00');
            expect(output.customerId).toBe(customer.id.value);
            expect(output.merchantId).toBe(merchant.id.value);
        })

        it('should debit customer and credit merchant wallets', async () => {
            await sut.execute(customer.id.value, { code: paymentLink.code });

            const updatedCustomerWallet = walletRepository.items.find(
                (w) => w.ownerId.equals(customer.id)
            );
            const updatedMerchantWallet = walletRepository.items.find(
                (w) => w.ownerId.equals(merchant.id)
            );

            expect(updatedCustomerWallet!.balance.amountInCents).toBe(15000);
            expect(updatedMerchantWallet!.balance.amountInCents).toBe(5000);
        });

        it('should mark payment link as USED', async () => {
            await sut.execute(customer.id.value, { code: paymentLink.code });

            const usedLink = paymentLinkRepository.items.find(
                (l) => l.id.equals(paymentLink.id)
            );

            expect(usedLink!.status).toBe('USED');
            expect(usedLink!.usedAt).not.toBeNull();
        })

        it('should persist transaction via unit of work', async () => {
            await sut.execute(customer.id.value, { code: paymentLink.code });

            expect(transactionRepository.items).toHaveLength(1);
            expect(transactionRepository.items[0]?.status).toBe('APPROVED');
        })

        it('should be case-insensitive for code', async () => {
            const output = await sut.execute(customer.id.value, {
                code: paymentLink.code.toLowerCase(),
            });

            expect(output.status).toBe('APPROVED');
        });
    });

    describe('failed payment', () => {
        it('should return failed transaction when insufficient funds', async () => {
            const poorWallet = Wallet.create(customer.id, 'CUSTOMER', 'BRL');
            poorWallet.credit(Money.create(100, 'BRL'));
            walletRepository.items = [poorWallet, merchantWallet];

            const expensiveLink = PaymentLink.create({
                merchantId: merchant.id,
                amountInCents: 99999,
                currency: 'BRL',
            });
            await paymentLinkRepository.save(expensiveLink);

            const output = await sut.execute(customer.id.value, {
                code: expensiveLink.code,
            });

            expect(output.status).toBe('FAILED');
            expect(output.denialReason).toBe('Insufficient funds');

            expect(paymentLink.isActive).toBe(true);
        })

        it('should dispatch transaction.failed webhook on failure', async () => {
            merchant.suspend();
            await merchantRepository.update(merchant);

            await sut.execute(customer.id.value, { code: paymentLink.code });

            expect(
                webhookPublisher.wasPublished(WEBHOOK_EVENTS.TRANSACTION_FAILED)
            ).toBe(true);
        });
    });

    describe('idempotency', () => {
        it('should return same transaction when idempotency key already exists', async () => {
            const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';

            const first = await sut.execute(customer.id.value, {
                code: paymentLink.code,
                idempotencyKey,
            });

            const secondLink = PaymentLink.create({
                merchantId: merchant.id,
                amountInCents: 5000,
                currency: 'BRL',
            });
            await paymentLinkRepository.save(secondLink);

            const second = await sut.execute(customer.id.value, {
                code: secondLink.code,
                idempotencyKey,
            });

            expect(first.id).toBe(second.id);
            expect(transactionRepository.items).toHaveLength(1);
        });
    });

    describe('webhook', () => {
        it('should dispatch transaction.approved webhook', async () => {
            await sut.execute(customer.id.value, { code: paymentLink.code })

            expect(
                webhookPublisher.wasPublished(WEBHOOK_EVENTS.TRANSACTION_APPROVED)
            ).toBe(true)
        });

        it('should dispatch webhook with correct merchantId', async () => {
            await sut.execute(customer.id.value, { code: paymentLink.code });

            const lastCall = webhookPublisher.lastCall();
            expect(lastCall?.merchantId).toBe(merchant.id.value);
        });
    });

    describe('payment link validation errors', () => {
        it('should throw PaymentLinkAlreadyUsedError for used link', async () => {
            paymentLink.markAsUsed();
            await paymentLinkRepository.update(paymentLink);

            await expect(
                sut.execute(customer.id.value, { code: paymentLink.code })
            ).rejects.toThrowError(PaymentLinkAlreadyUsedError);
        });

        it('should throw PaymentLinkExpiredError for expired link', async () => {
            vi.setSystemTime(new Date(Date.now() + 25 * 60 * 60 * 1000));

            await expect(
                sut.execute(customer.id.value, { code: paymentLink.code })
            ).rejects.toThrowError(PaymentLinkExpiredError);

            vi.useRealTimers();
        });
    });

    describe('not found errors', () => {
        it('should throw NotFoundError for non-existent code', async () => {
            await expect(
                sut.execute(customer.id.value, { code: 'PAY-INVALID' })
            ).rejects.toThrowError(NotFoundError)
        })

        it('should throw NotFoundError when customer does not exist', async () => {
            await expect(
                sut.execute('00000000-0000-0000-0000-000000000000', {
                code: paymentLink.code,
                })
            ).rejects.toThrowError(NotFoundError)
        })

        it('should throw NotFoundError when merchant does not exist', async () => {
            const linkWithNoMerchant = PaymentLink.create({
                merchantId: new UniqueEntityId(),
                amountInCents: 5000,
                currency: 'BRL',
            });
            await paymentLinkRepository.save(linkWithNoMerchant);

            await expect(
                sut.execute(customer.id.value, { code: linkWithNoMerchant.code })
            ).rejects.toThrowError(NotFoundError);
        });

        it('should throw NotFoundError when customer wallet does not exist', async () => {
            const customerNoWallet = await Customer.create({
                name: 'No Wallet',
                email: 'nowallet@email.com',
                cpf: '233.958.190-78',
                password: 'senha123',
            });
            await customerRepository.save(customerNoWallet);

            await expect(
                sut.execute(customerNoWallet.id.value, { code: paymentLink.code })
            ).rejects.toThrowError(NotFoundError);
        });
    });
})