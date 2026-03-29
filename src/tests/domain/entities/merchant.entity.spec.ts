import { describe, it, expect } from 'vitest'
import { Merchant } from '@/domain/entities/merchant.entity.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { InvalidCNPJError } from '@/domain/errors/invalid-cnpj.error.js'
import { InvalidEmailError } from '@/domain/errors/invalid-email.error.js'

describe('Merchant Entity', () => {
  const makeMerchant = async (overrides = {}) =>
    Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
      ...overrides,
    })

  describe('create', () => {
    it('should create a merchant with ACTIVE status by default', async () => {
      const merchant = await makeMerchant()
      expect(merchant.status).toBe('ACTIVE')
      expect(merchant.isActive).toBe(true)
    })

    it('should create a merchant with valid data', async () => {
      const merchant = await makeMerchant()
      expect(merchant.name).toBe('Empresa Exemplo LTDA')
      expect(merchant.tradeName).toBe('Exemplo Store')
      expect(merchant.email.value).toBe('contato@exemplo.com')
      expect(merchant.cnpj.value).toBe('11222333000181')
      expect(merchant.refreshToken).toBeNull()
    })

    it('should hash the password on create', async () => {
      const merchant = await makeMerchant()
      expect(merchant.password.value).not.toBe('senha123')
    })

    it('should throw for invalid CNPJ', async () => {
      await expect(
        makeMerchant({ cnpj: '11.111.111/1111-11' })
      ).rejects.toThrowError(InvalidCNPJError)
    })

    it('should throw for invalid email', async () => {
      await expect(makeMerchant({ email: 'invalid' })).rejects.toThrowError(
        InvalidEmailError
      )
    })

    it('should throw for password shorter than 6 chars', async () => {
      await expect(makeMerchant({ password: '123' })).rejects.toThrowError(
        InvalidArgumentError
      )
    })
  })

  describe('suspend', () => {
    it('should suspend an active merchant', async () => {
      const merchant = await makeMerchant()
      merchant.suspend()
      expect(merchant.status).toBe('SUSPENDED')
      expect(merchant.isActive).toBe(false)
    })

    it('should throw when trying to suspend an inactive merchant', async () => {
      const merchant = await makeMerchant()
      merchant.deactivate()
      expect(() => merchant.suspend()).toThrowError(InvalidArgumentError)
    })
  })

  describe('activate', () => {
    it('should activate a suspended merchant', async () => {
      const merchant = await makeMerchant()
      merchant.suspend()
      merchant.activate()
      expect(merchant.status).toBe('ACTIVE')
    })

    it('should do nothing when activating an already active merchant', async () => {
      const merchant = await makeMerchant()
      expect(() => merchant.activate()).not.toThrow()
      expect(merchant.status).toBe('ACTIVE')
    })
  })

  describe('deactivate', () => {
    it('should deactivate an active merchant', async () => {
      const merchant = await makeMerchant()
      merchant.deactivate()
      expect(merchant.status).toBe('INACTIVE')
    })
  })

  describe('updateTradeName', () => {
    it('should update trade name correctly', async () => {
      const merchant = await makeMerchant()
      merchant.updateTradeName('New Trade Name')
      expect(merchant.tradeName).toBe('New Trade Name')
    })

    it('should throw for trade name shorter than 3 chars', async () => {
      const merchant = await makeMerchant()
      expect(() => merchant.updateTradeName('AB')).toThrowError(
        InvalidArgumentError
      )
    })
  })

  describe('setRefreshToken', () => {
    it('should set refresh token correctly', async () => {
      const merchant = await makeMerchant()
      merchant.setRefreshToken('some-refresh-token')
      expect(merchant.refreshToken).toBe('some-refresh-token')
    })

    it('should allow setting refresh token to null', async () => {
      const merchant = await makeMerchant()
      merchant.setRefreshToken('some-refresh-token')
      merchant.setRefreshToken(null)
      expect(merchant.refreshToken).toBeNull()
    })
  })

  describe('password', () => {
    it('should validate correct password', async () => {
      const merchant = await makeMerchant()
      const isValid = await merchant.password.compare('senha123')
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const merchant = await makeMerchant()
      const isValid = await merchant.password.compare('wrong-password')
      expect(isValid).toBe(false)
    })
  })
})