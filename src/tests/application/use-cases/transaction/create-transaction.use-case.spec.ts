import { describe, it, expect, beforeEach } from 'vitest'
import { CreateTransactionUseCase } from '@/application/use-cases/transaction/create-transaction.use-case.js'
import { InMemoryTransactionRepository } from '@/tests/repositories/in-memory-transaction.repository.js'
import { InMemoryCustomerRepository } from '@/tests/repositories/in-memory-customer.repository.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { InMemoryWalletRepository } from '@/tests/repositories/in-memory-wallet.repository.js'
import { AuthorizationServiceImpl } from '@/infra/services/authorization.service.impl.js'
import { Customer } from '@/domain/entities/customer.entity.js'
import { Merchant } from '@/domain/entities/merchant.entity.js'
import { Wallet } from '@/domain/entities/wallet.entity.js'
import { Money } from '@/domain/value-objects/money.vo.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'

describe('CreateTransactionUseCase', () => {
  let transactionRepository: InMemoryTransactionRepository
  let customerRepository: InMemoryCustomerRepository
  let merchantRepository: InMemoryMerchantRepository
  let walletRepository: InMemoryWalletRepository
  let authorizationService: AuthorizationServiceImpl
  let sut: CreateTransactionUseCase

  let customer: Customer
  let merchant: Merchant
  let customerWallet: Wallet
  let merchantWallet: Wallet

  beforeEach(async () => {
    transactionRepository = new InMemoryTransactionRepository()
    customerRepository = new InMemoryCustomerRepository()
    merchantRepository = new InMemoryMerchantRepository()
    walletRepository = new InMemoryWalletRepository()
    authorizationService = new AuthorizationServiceImpl()

    sut = new CreateTransactionUseCase(
      transactionRepository,
      customerRepository,
      merchantRepository,
      walletRepository,
      authorizationService
    )

    customer = await Customer.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })
    await customerRepository.save(customer)

    customerWallet = Wallet.create(customer.id, 'CUSTOMER', 'BRL')
    customerWallet.credit(Money.create(20000, 'BRL'))
    await walletRepository.save(customerWallet)

    merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    await merchantRepository.save(merchant)

    merchantWallet = Wallet.create(merchant.id, 'MERCHANT', 'BRL')
    await walletRepository.save(merchantWallet)
  })

  describe('approved transactions', () => {
    it('should create an approved transaction and move funds', async () => {
      const output = await sut.execute(customer.id.value, {
        merchantId: merchant.id.value,
        amountInCents: 5000,
      })

      expect(output.status).toBe('APPROVED')
      expect(output.amountInCents).toBe(5000)
      expect(output.denialReason).toBeNull()
      expect(transactionRepository.items).toHaveLength(1)

      const updatedCustomerWallet = await walletRepository.findByOwnerId(customer.id)
      const updatedMerchantWallet = await walletRepository.findByOwnerId(merchant.id)

      expect(updatedCustomerWallet!.balance.amountInCents).toBe(15000)
      expect(updatedMerchantWallet!.balance.amountInCents).toBe(5000)
    })

    it('should create transaction with description', async () => {
      const output = await sut.execute(customer.id.value, {
        merchantId: merchant.id.value,
        amountInCents: 5000,
        description: 'Compra de produto X',
      })

      expect(output.description).toBe('Compra de produto X')
    })

    it('should return formatted amount', async () => {
      const output = await sut.execute(customer.id.value, {
        merchantId: merchant.id.value,
        amountInCents: 5000,
      })

      expect(output.amountFormatted).toBe('50.00')
    })
  })

  describe('failed transactions', () => {
    it('should create a failed transaction when merchant is suspended', async () => {
      merchant.suspend()
      await merchantRepository.update(merchant)

      const output = await sut.execute(customer.id.value, {
        merchantId: merchant.id.value,
        amountInCents: 5000,
      })

      expect(output.status).toBe('FAILED')
      expect(output.denialReason).toBe('Merchant is not active')

      const customerWalletAfter = await walletRepository.findByOwnerId(customer.id)
      const merchantWalletAfter = await walletRepository.findByOwnerId(merchant.id)

      expect(customerWalletAfter!.balance.amountInCents).toBe(20000)
      expect(merchantWalletAfter!.balance.amountInCents).toBe(0)
    })

    it('should create a failed transaction when insufficient funds', async () => {
      const output = await sut.execute(customer.id.value, {
        merchantId: merchant.id.value,
        amountInCents: 99999,
      })

      expect(output.status).toBe('FAILED')
      expect(output.denialReason).toBe('Insufficient funds')
    })
  })

  describe('idempotency', () => {
    it('should return same transaction when idempotency key already exists', async () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000'

      const first = await sut.execute(customer.id.value, {
        merchantId: merchant.id.value,
        amountInCents: 5000,
        idempotencyKey,
      })

      const second = await sut.execute(customer.id.value, {
        merchantId: merchant.id.value,
        amountInCents: 5000,
        idempotencyKey,
      })

      expect(first.id).toBe(second.id)

      expect(transactionRepository.items).toHaveLength(1)

      const walletAfter = await walletRepository.findByOwnerId(customer.id)
      expect(walletAfter!.balance.amountInCents).toBe(15000)
    })
  })

  describe('not found errors', () => {
    it('should throw NotFoundError when customer does not exist', async () => {
      await expect(
        sut.execute('00000000-0000-0000-0000-000000000000', {
          merchantId: merchant.id.value,
          amountInCents: 5000,
        })
      ).rejects.toThrowError(NotFoundError)
    })

    it('should throw NotFoundError when merchant does not exist', async () => {
      await expect(
        sut.execute(customer.id.value, {
          merchantId: '00000000-0000-0000-0000-000000000000',
          amountInCents: 5000,
        })
      ).rejects.toThrowError(NotFoundError)
    })

    it('should throw NotFoundError when customer wallet does not exist', async () => {
      const customerWithoutWallet = await Customer.create({
        name: 'No Wallet',
        email: 'nowallet@example.com',
        cpf: '769.193.330-40',
        password: 'senha123',
      })
      await customerRepository.save(customerWithoutWallet)

      await expect(
        sut.execute(customerWithoutWallet.id.value, {
          merchantId: merchant.id.value,
          amountInCents: 5000,
        })
      ).rejects.toThrowError(NotFoundError)
    })

    it('should throw NotFoundError when merchant wallet does not exist', async () => {
      const merchantWithoutWallet = await Merchant.create({
        name: 'Sem Wallet LTDA',
        tradeName: 'Sem Wallet',
        email: 'semwallet@exemplo.com',
        cnpj: '33.784.738/0001-46',
        password: 'senha123',
      })
      await merchantRepository.save(merchantWithoutWallet)

      await expect(
        sut.execute(customer.id.value, {
          merchantId: merchantWithoutWallet.id.value,
          amountInCents: 5000,
        })
      ).rejects.toThrowError(NotFoundError)
    })
  })
})