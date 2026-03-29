import { describe, it, expect } from 'vitest'
import { Customer } from '@/domain/entities/customer.entity.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { InvalidEmailError } from '@/domain/errors/invalid-email.error.js'
import { InvalidCPFError } from '@/domain/errors/invalid-cpf.error.js'

describe('Customer Entity', () => {
  const makeCustomer = async (overrides = {}) =>
    Customer.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
      ...overrides,
    })

  describe('create', () => {
    it('should create a customer with valid data', async () => {
      const customer = await makeCustomer()
      expect(customer.name).toBe('John Doe')
      expect(customer.email.value).toBe('john@example.com')
      expect(customer.cpf.value).toBe('52998224725')
      expect(customer.phone).toBeNull()
      expect(customer.refreshToken).toBeNull()
    })

    it('should hash the password on create', async () => {
      const customer = await makeCustomer()
      expect(customer.password.value).not.toBe('senha123')
    })

    it('should create a customer with phone', async () => {
      const customer = await makeCustomer({ phone: '11999999999' })
      expect(customer.phone).toBe('11999999999')
    })

    it('should throw for name shorter than 3 chars', async () => {
      await expect(makeCustomer({ name: 'Jo' })).rejects.toThrowError(
        InvalidArgumentError
      )
    })

    it('should throw for name longer than 100 chars', async () => {
      await expect(
        makeCustomer({ name: 'A'.repeat(101) })
      ).rejects.toThrowError(InvalidArgumentError)
    })

    it('should throw for invalid email', async () => {
      await expect(makeCustomer({ email: 'invalid' })).rejects.toThrowError(
        InvalidEmailError
      )
    })

    it('should throw for invalid CPF', async () => {
      await expect(
        makeCustomer({ cpf: '111.111.111-11' })
      ).rejects.toThrowError(InvalidCPFError)
    })

    it('should throw for password shorter than 6 chars', async () => {
      await expect(makeCustomer({ password: '123' })).rejects.toThrowError(
        InvalidArgumentError
      )
    })
  })

  describe('updateName', () => {
    it('should update name correctly', async () => {
      const customer = await makeCustomer()
      customer.updateName('Jane Doe')
      expect(customer.name).toBe('Jane Doe')
    })

    it('should throw for invalid name on update', async () => {
      const customer = await makeCustomer()
      expect(() => customer.updateName('Jo')).toThrowError(InvalidArgumentError)
    })
  })

  describe('updateEmail', () => {
    it('should update email correctly', async () => {
      const customer = await makeCustomer()
      customer.updateEmail('newemail@example.com')
      expect(customer.email.value).toBe('newemail@example.com')
    })

    it('should throw for invalid email on update', async () => {
      const customer = await makeCustomer()
      expect(() => customer.updateEmail('not-an-email')).toThrowError(
        InvalidEmailError
      )
    })
  })

  describe('updatePhone', () => {
    it('should update phone correctly', async () => {
      const customer = await makeCustomer()
      customer.updatePhone('11988887777')
      expect(customer.phone).toBe('11988887777')
    })

    it('should allow setting phone to null', async () => {
      const customer = await makeCustomer({ phone: '11988887777' })
      customer.updatePhone(null)
      expect(customer.phone).toBeNull()
    })
  })

  describe('setRefreshToken', () => {
    it('should set refresh token correctly', async () => {
      const customer = await makeCustomer()
      customer.setRefreshToken('some-refresh-token')
      expect(customer.refreshToken).toBe('some-refresh-token')
    })

    it('should allow setting refresh token to null', async () => {
      const customer = await makeCustomer()
      customer.setRefreshToken('some-refresh-token')
      customer.setRefreshToken(null)
      expect(customer.refreshToken).toBeNull()
    })
  })

  describe('password', () => {
    it('should validate correct password', async () => {
      const customer = await makeCustomer()
      const isValid = await customer.password.compare('senha123')
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const customer = await makeCustomer()
      const isValid = await customer.password.compare('wrong-password')
      expect(isValid).toBe(false)
    })
  })
})