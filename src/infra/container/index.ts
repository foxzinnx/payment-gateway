import { CreateCustomerUseCase } from "@/application/use-cases/customer/create-customer.use-case.js";
import { PrismaCustomerRepository } from "../database/prisma/repositories/prisma-customer.repository.js"
import { PrismaMerchantRepository } from "../database/prisma/repositories/prisma-merchant.repository.js";
import { PrismaWalletRepository } from "../database/prisma/repositories/prisma-wallet.repository.js";
import { GetCustomerByIdUseCase } from "@/application/use-cases/customer/get-customer-by-id.use-case.js";
import { UpdateCustomerUseCase } from "@/application/use-cases/customer/update-customer.use-case.js";
import { CreateMerchantUseCase } from "@/application/use-cases/merchant/create-merchant.use-case.js";
import { GetMerchantByIdUseCase } from "@/application/use-cases/merchant/get-merchant-by-id.use-case.js";
import { UpdateMerchantUseCase } from "@/application/use-cases/merchant/update-merchant.use-case.js";
import { SuspendMerchantUseCase } from "@/application/use-cases/merchant/suspend-merchant.use-case.js";
import { CreateWalletUseCase } from "@/application/use-cases/wallet/create-wallet.use-case.js";
import { GetWalletByOwnerIdUseCase } from "@/application/use-cases/wallet/get-wallet-by-owner-id.use-case.js";
import { CreditWalletUseCase } from "@/application/use-cases/wallet/credit-wallet.use-case.js";
import { DebitWalletUseCase } from "@/application/use-cases/wallet/debit-wallet.use-case.js";

const customerRepository = new PrismaCustomerRepository();
const merchantRepository = new PrismaMerchantRepository();
const walletRepository = new PrismaWalletRepository();

export const container = {
    createCustomer: new CreateCustomerUseCase(customerRepository),
    getCustomerById: new GetCustomerByIdUseCase(customerRepository),
    updateCustomer: new UpdateCustomerUseCase(customerRepository),

    createMerchant: new CreateMerchantUseCase(merchantRepository),
    getMerchantById: new GetMerchantByIdUseCase(merchantRepository),
    updateMerchant: new UpdateMerchantUseCase(merchantRepository),
    suspendMerchant: new SuspendMerchantUseCase(merchantRepository),

    createWallet: new CreateWalletUseCase(walletRepository),
    getWalletById: new GetWalletByOwnerIdUseCase(walletRepository),
    creditWallet: new CreditWalletUseCase(walletRepository),
    debitWallet: new DebitWalletUseCase(walletRepository)
} as const