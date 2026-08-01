import { CreateDepositUseCase } from "@/application/use-cases/deposit/create-deposit.use-case.js";
import { Wallet } from "@/domain/entities/wallet.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { WEBHOOK_EVENTS } from "@/domain/webhooks/webhook-event.js";
import { InMemoryDepositRepository } from "@/tests/repositories/in-memory-deposit.repository.js";
import { InMemoryWalletRepository } from "@/tests/repositories/in-memory-wallet.repository.js";
import { InMemoryWebhookPublisher } from "@/tests/services/in-memory-webhook-publisher.js";
import { InMemoryDepositUnitOfWork } from "@/tests/unit-of-work/in-memory-deposit.unit-of-work.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('CreateDepositUseCase', () => {
    let depositRepository: InMemoryDepositRepository;
    let walletRepository: InMemoryWalletRepository;
    let depositUnitOfWork: InMemoryDepositUnitOfWork;
    let webhookPublisher: InMemoryWebhookPublisher;
    let sut: CreateDepositUseCase;

    let customerId: string;
    let customerWallet: Wallet;

    beforeEach(async () => {
        depositRepository = new InMemoryDepositRepository();
        walletRepository = new InMemoryWalletRepository();
        depositUnitOfWork = new InMemoryDepositUnitOfWork();
        webhookPublisher = new InMemoryWebhookPublisher();
        sut = new CreateDepositUseCase(depositRepository, walletRepository, depositUnitOfWork, webhookPublisher);

        customerId = new UniqueEntityId().value;
        customerWallet = Wallet.create(new UniqueEntityId(customerId), 'CUSTOMER', 'BRL');
        await walletRepository.save(customerWallet);

        depositUnitOfWork.wallets.push(customerWallet);
    });

    describe('successful deposit', () => {
        it('should create a completed deposit', async () => {
            const output = await sut.execute(customerId, {
                amountInCents: 5000,
                currency: 'BRL',
                method: 'PIX'
            });

            expect(output.status).toBe('COMPLETED');
            expect(output.amountInCents).toBe(5000);
            expect(output.amountFormatted).toBe('50.00');
            expect(output.currency).toBe('BRL');
            expect(output.method).toBe('PIX');
            expect(output.customerId).toBe(customerId);
        });

        it('should credit wallet after deposit', async () => {
            await sut.execute(customerId, { amountInCents: 5000 });

            const updatedWallet = depositUnitOfWork.wallets.find(
                (w) => w.ownerId.value === customerId
            );

            expect(updatedWallet?.balance.amountInCents).toBe(5000);
        });

        it('should persist deposit via unit of work', async () => {
            await sut.execute(customerId, { amountInCents: 5000 });

            expect(depositUnitOfWork.deposits).toHaveLength(1);
            expect(depositUnitOfWork.deposits[0]?.status).toBe('COMPLETED')
        });

        it('should create deposit with default PIX method', async () => {
            const output = await sut.execute(customerId, { amountInCents: 5000 });

            expect(output.method).toBe('PIX');
        });

        it('should create deposit with TED method', async () => {
            const output = await sut.execute(customerId, {
                amountInCents: 5000,
                method: 'TED',
            })

            expect(output.method).toBe('TED');
        });

        it('should create deposit with BOLETO method', async () => {
            const output = await sut.execute(customerId, {
                amountInCents: 5000,
                method: 'BOLETO',
            })

            expect(output.method).toBe('BOLETO')
        });

        it('should accumulate multiple deposits', async () => {
            await sut.execute(customerId, { amountInCents: 5000 })
            await sut.execute(customerId, { amountInCents: 3000 })

            const updatedWallet = depositUnitOfWork.wallets.find(
                (w) => w.ownerId.value === customerId
            )

            expect(updatedWallet!.balance.amountInCents).toBe(8000)
            expect(depositUnitOfWork.deposits).toHaveLength(2)
        });
    });

    describe('webhook', () => {
        it('should dispatch deposit.completed webhook', async () => {
            await sut.execute(customerId, { amountInCents: 5000 });

            expect(webhookPublisher.wasPublished(WEBHOOK_EVENTS.DEPOSIT_COMPLETED)).toBe(true);
        });

        it('should dispatch webhook with correct customerId', async () => {
            await sut.execute(customerId, { amountInCents: 5000 });

            const lastCall = webhookPublisher.lastCall();
            expect(lastCall?.merchantId).toBe(customerId);
        });
    });

    describe('not found errors', () => {
        it('should throw NotFoundError when wallet does not exist', async () => {
            const nonExistentCustomerId = new UniqueEntityId().value;

            await expect(
                sut.execute(nonExistentCustomerId, { amountInCents: 5000 })
            ).rejects.toThrowError(NotFoundError);
        })
    })
})