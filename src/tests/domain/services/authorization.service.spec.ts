import { describe, it, expect } from 'vitest'
import { AuthorizationServiceImpl } from '@/infra/services/authorization.service.impl.js'
import { Transaction } from '@/domain/entities/transaction.entity.js'
import { Wallet } from '@/domain/entities/wallet.entity.js'
import { Merchant } from '@/domain/entities/merchant.entity.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'
import { Money } from '@/domain/value-objects/money.vo.js'

describe('AuthorizationService', () => {
  const sut = new AuthorizationServiceImpl()

  const makeTransaction = (amountInCents = 5000) =>
    Transaction.create({
      customerId: new UniqueEntityId(),
      merchantId: new UniqueEntityId(),
      amountInCents,
    })

  const makeWalletWithBalance = async (balanceInCents: number) => {
    const wallet = Wallet.create(new UniqueEntityId(), 'CUSTOMER', 'BRL')
    if (balanceInCents > 0) {
      wallet.credit(Money.create(balanceInCents, 'BRL'))
    }
    return wallet
  }

  const makeMerchant = async (status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' = 'ACTIVE') => {
    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    if (status === 'INACTIVE') merchant.deactivate()
    if (status === 'SUSPENDED') merchant.suspend()
    return merchant
  }

  describe('authorize', () => {
    it('should authorize a valid transaction', async () => {
      const transaction = makeTransaction(5000)
      const wallet = await makeWalletWithBalance(10000)
      const merchant = await makeMerchant('ACTIVE')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(true)
    })

    it('should deny when merchant is inactive', async () => {
      const transaction = makeTransaction(5000)
      const wallet = await makeWalletWithBalance(10000)
      const merchant = await makeMerchant('INACTIVE')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(false)
      if (!result.authorized) {
        expect(result.reason).toBe('Merchant is not active')
      }
    })

    it('should deny when merchant is suspended', async () => {
      const transaction = makeTransaction(5000)
      const wallet = await makeWalletWithBalance(10000)
      const merchant = await makeMerchant('SUSPENDED')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(false)
      if (!result.authorized) {
        expect(result.reason).toBe('Merchant is not active')
      }
    })

    it('should deny when customer has insufficient funds', async () => {
      const transaction = makeTransaction(5000)
      const wallet = await makeWalletWithBalance(1000)
      const merchant = await makeMerchant('ACTIVE')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(false)
      if (!result.authorized) {
        expect(result.reason).toBe('Insufficient funds')
      }
    })

    it('should deny when amount exceeds maximum limit', async () => {
      const transaction = makeTransaction(1_000_001)
      const wallet = await makeWalletWithBalance(2_000_000)
      const merchant = await makeMerchant('ACTIVE')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(false)
      if (!result.authorized) {
        expect(result.reason).toContain('exceeds the limit')
      }
    })

    it('should deny when amount is below minimum', async () => {
      const transaction = makeTransaction(50)
      const wallet = await makeWalletWithBalance(10000)
      const merchant = await makeMerchant('ACTIVE')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(false)
      if (!result.authorized) {
        expect(result.reason).toContain('minimum')
      }
    })

    it('should authorize transaction with exact minimum amount', async () => {
      const transaction = makeTransaction(100)
      const wallet = await makeWalletWithBalance(10000)
      const merchant = await makeMerchant('ACTIVE')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(true)
    })

    it('should authorize transaction with exact maximum amount', async () => {
      const transaction = makeTransaction(1_000_000)
      const wallet = await makeWalletWithBalance(1_000_000)
      const merchant = await makeMerchant('ACTIVE')

      const result = sut.authorize(transaction, wallet, merchant)

      expect(result.authorized).toBe(true)
    })
  })
})