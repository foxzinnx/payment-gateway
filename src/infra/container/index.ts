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
import { GetCustomerTransactionsUseCase } from "@/application/use-cases/transaction/get-customer-transactions.use-case.js";

const customerRepository = new PrismaCustomerRepository();
const merchantRepository = new PrismaMerchantRepository();
const walletRepository = new PrismaWalletRepository();
const transactionRepository = new PrismaTransactionRepository()

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
    getWalletById: new GetWalletByOwnerIdUseCase(walletRepository),
    creditWallet: new CreditWalletUseCase(walletRepository),
    debitWallet: new DebitWalletUseCase(walletRepository),

    createTransaction: new CreateTransactionUseCase(
        transactionRepository,
        customerRepository,
        merchantRepository,
        walletRepository,
        authorizationService
    ),
    getTransactionById: new GetTransactionByIdUseCase(transactionRepository),
    getCustomerTransactions: new GetCustomerTransactionsUseCase(transactionRepository),
} as const