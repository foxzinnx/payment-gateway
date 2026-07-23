import { PrismaCustomerRepository } from "../database/prisma/repositories/prisma-customer.repository.js"
import { PrismaMerchantRepository } from "../database/prisma/repositories/prisma-merchant.repository.js";
import { PrismaWalletRepository } from "../database/prisma/repositories/prisma-wallet.repository.js";
import { GetCustomerByIdUseCase } from "@/application/use-cases/customer/get-customer-by-id.use-case.js";
import { UpdateCustomerUseCase } from "@/application/use-cases/customer/update-customer.use-case.js";
import { GetMerchantByIdUseCase } from "@/application/use-cases/merchant/get-merchant-by-id.use-case.js";
import { UpdateMerchantUseCase } from "@/application/use-cases/merchant/update-merchant.use-case.js";
import { SuspendMerchantUseCase } from "@/application/use-cases/merchant/suspend-merchant.use-case.js";
import { CreateWalletUseCase } from "@/application/use-cases/wallet/create-wallet.use-case.js";
import { GetWalletByOwnerIdUseCase } from "@/application/use-cases/wallet/get-wallet-by-owner-id.use-case.js";
import { CreditWalletUseCase } from "@/application/use-cases/wallet/credit-wallet.use-case.js";
import { DebitWalletUseCase } from "@/application/use-cases/wallet/debit-wallet.use-case.js";
import { RegisterCustomerUseCase } from "@/application/use-cases/auth/register-customer.use-case.js";
import { LoginCustomerUseCase } from "@/application/use-cases/auth/login-customer.use-case.js";
import { RefreshTokenCustomerUseCase } from "@/application/use-cases/auth/refresh-token-customer.use-case.js";
import { RegisterMerchantUseCase } from "@/application/use-cases/auth/register-merchant.use-case.js";
import { LoginMerchantUseCase } from "@/application/use-cases/auth/login-merchant.use-case.js";
import { RefreshTokenMerchantUseCase } from "@/application/use-cases/auth/refresh-token-merchant.use-case.js";
import { PrismaTransactionRepository } from "../database/prisma/repositories/prisma-transaction.repository.js";
import { authorizationService } from "../services/authorization.service.impl.js";
import { CreateTransactionUseCase } from "@/application/use-cases/transaction/create-transaction.use-case.js";
import { GetTransactionByIdUseCase } from "@/application/use-cases/transaction/get-transaction-by-id.use-case.js";
import { GetCustomerTransactionsUseCase } from "@/application/use-cases/customer/get-customer-transactions.use-case.js";
import { GetWalletByIdUseCase } from "@/application/use-cases/wallet/get-wallet-by-id.use-case.js";
import { PayWithLinkUseCase } from "@/application/use-cases/payment-link/pay-with-link.use-case.js";
import { PrismaPaymentLinkRepository } from "../database/prisma/repositories/prisma-payment-link.repository.js";
import { PrismaPaymentUnitOfWork } from "../database/prisma/unit-of-work/payment.unit-of-work.js";
import { CreatePaymentLinkUseCase } from "@/application/use-cases/payment-link/create-payment-link.use-case.js";
import { GetPaymentLinkDetailsUseCase } from "@/application/use-cases/payment-link/get-payment-link-details.use-case.js";
import { PrismaDepositRepository } from "../database/prisma/repositories/prisma-deposit.repository.js";
import { PrismaDepositUnitOfWork } from "../database/prisma/unit-of-work/deposit.unit-of-work.js";
import { CreateDepositUseCase } from "@/application/use-cases/deposit/create-deposit.use-case.js";
import { GetCustomerDepositsUseCase } from "@/application/use-cases/deposit/get-customer-deposits.use-case.js";
import { GetMyProfileUseCase } from "@/application/use-cases/customer/get-my-profile.use-case.js";
import { GetMerchantTransactionsUseCase } from "@/application/use-cases/merchant/get-merchant-transactions.use-case.js";
import { GetMerchantPaymentLinksUseCase } from "@/application/use-cases/payment-link/get-merchant-payment-links.use-case.js";
import { PrismaRefundRepository } from "../database/prisma/repositories/prisma-refund.repository.js";
import { CreateRefundUseCase } from "@/application/use-cases/refund/create-refund.use-case.js";
import { PrismaRefundUnitOfWork } from "../database/prisma/unit-of-work/refund.unit-of-work.js";
import { WebhookPublisherService } from "../services/webhook.publisher.service.js";
import { PrismaWebhookRepository } from "../database/prisma/repositories/prisma-webhook.repository.js";
import { PrismaPayWithLinkUnitOfWork } from "../database/prisma/unit-of-work/pay-with-link.unit-of-work.js";

const customerRepository = new PrismaCustomerRepository();
const merchantRepository = new PrismaMerchantRepository();
const walletRepository = new PrismaWalletRepository();
const transactionRepository = new PrismaTransactionRepository();
const paymentLinkRepository = new PrismaPaymentLinkRepository();
const depositRepository = new PrismaDepositRepository();
const refundRepository = new PrismaRefundRepository();
const webhookRepository = new PrismaWebhookRepository();
const paymentUnitOfWork = new PrismaPaymentUnitOfWork();
const depositUnitOfWork = new PrismaDepositUnitOfWork();
const refundUnitOfWork = new PrismaRefundUnitOfWork();
const payWithLinkUnitOfWork = new PrismaPayWithLinkUnitOfWork();
export const webhookPublisher = new WebhookPublisherService(webhookRepository);

export const container = {
    registerCustomer: new RegisterCustomerUseCase(customerRepository),
    loginCustomer: new LoginCustomerUseCase(customerRepository),
    refreshTokenCustomer: new RefreshTokenCustomerUseCase(customerRepository),
    getCustomerById: new GetCustomerByIdUseCase(customerRepository),
    updateCustomer: new UpdateCustomerUseCase(customerRepository),

    registerMerchant: new RegisterMerchantUseCase(merchantRepository),
    loginMerchant: new LoginMerchantUseCase(merchantRepository),
    refreshTokenMerchant: new RefreshTokenMerchantUseCase(merchantRepository),
    getMerchantById: new GetMerchantByIdUseCase(merchantRepository),
    updateMerchant: new UpdateMerchantUseCase(merchantRepository),
    suspendMerchant: new SuspendMerchantUseCase(merchantRepository),

    createWallet: new CreateWalletUseCase(walletRepository),
    getWalletByOwnerId: new GetWalletByOwnerIdUseCase(walletRepository),
    getWalletById: new GetWalletByIdUseCase(walletRepository),
    creditWallet: new CreditWalletUseCase(walletRepository),
    debitWallet: new DebitWalletUseCase(walletRepository),

    createTransaction: new CreateTransactionUseCase(
        transactionRepository,
        customerRepository,
        merchantRepository,
        walletRepository,
        paymentUnitOfWork,
        authorizationService,
        webhookPublisher
    ),
    getTransactionById: new GetTransactionByIdUseCase(transactionRepository),
    getCustomerTransactions: new GetCustomerTransactionsUseCase(transactionRepository),
    getMerchantTransactions: new GetMerchantTransactionsUseCase(transactionRepository),

    createPaymentLink: new CreatePaymentLinkUseCase(paymentLinkRepository, merchantRepository, walletRepository),
    getPaymentLinkDetails: new GetPaymentLinkDetailsUseCase(paymentLinkRepository, merchantRepository),
    payWithLink: new PayWithLinkUseCase(
        paymentLinkRepository,
        customerRepository,
        merchantRepository,
        walletRepository,
        transactionRepository,
        authorizationService,
        payWithLinkUnitOfWork
    ),
    getMerchantPaymentLinks: new GetMerchantPaymentLinksUseCase(paymentLinkRepository),
    createDeposit: new CreateDepositUseCase(
        depositRepository,
        walletRepository,
        depositUnitOfWork,
        webhookPublisher
    ),
    getCustomerDeposits: new GetCustomerDepositsUseCase(depositRepository),
    getMyProfile: new GetMyProfileUseCase(customerRepository),

    createRefund: new CreateRefundUseCase(refundRepository, transactionRepository, walletRepository, refundUnitOfWork, webhookPublisher)
} as const