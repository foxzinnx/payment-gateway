import { describe, it, expect } from 'vitest'
import { Transaction } from '@/domain/entities/transaction.entity.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { TransactionAmountMustBePositiveError } from '@/domain/errors/transaction-amount-must-be-positive.error.js'

describe('Transaction Entity', () => {
  const makeTransaction = (overrides = {}) =>
    Transaction.create({
      customerId: new UniqueEntityId(),
      merchantId: new UniqueEntityId(),
      amountInCents: 5000,
      currency: 'BRL',
      ...overrides,
    })

  describe('create', () => {
    it('should create a transaction with PENDING status', () => {
      const transaction = makeTransaction()

      expect(transaction.status).toBe('PENDING')
      expect(transaction.isPending).toBe(true)
      expect(transaction.isApproved).toBe(false)
      expect(transaction.isFailed).toBe(false)
      expect(transaction.amount.amountInCents).toBe(5000)
      expect(transaction.denialReason).toBeNull()
    })

    it('should create a transaction with description', () => {
      const transaction = makeTransaction({ description: 'Compra de produto X' })
      expect(transaction.description).toBe('Compra de produto X')
    })

    it('should create a transaction with idempotency key', () => {
      const key = '550e8400-e29b-41d4-a716-446655440000'
      const transaction = makeTransaction({ idempotencyKey: key })
      expect(transaction.idempotencyKey).toBe(key)
    })

    it('should throw for non-positive amount', () => {
      expect(() => makeTransaction({ amountInCents: 0 })).toThrowError(
        TransactionAmountMustBePositiveError
      )
      expect(() => makeTransaction({ amountInCents: -100 })).toThrowError(
        TransactionAmountMustBePositiveError
      )
    })
  })

  describe('approve', () => {
    it('should approve a pending transaction', () => {
      const transaction = makeTransaction()
      transaction.approve()

      expect(transaction.status).toBe('APPROVED')
      expect(transaction.isApproved).toBe(true)
      expect(transaction.isPending).toBe(false)
    })

    it('should throw when approving a non-pending transaction', () => {
      const transaction = makeTransaction()
      transaction.approve()

      expect(() => transaction.approve()).toThrowError(InvalidArgumentError)
    })

    it('should throw when approving a failed transaction', () => {
      const transaction = makeTransaction()
      transaction.fail('Insufficient funds')

      expect(() => transaction.approve()).toThrowError(InvalidArgumentError)
    })

    it('should update updatedAt on approve', () => {
      const transaction = makeTransaction()
      const before = transaction.updatedAt
      transaction.approve()
      expect(transaction.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      )
    })
  })

  describe('fail', () => {
    it('should fail a pending transaction with reason', () => {
      const transaction = makeTransaction()
      transaction.fail('Insufficient funds')

      expect(transaction.status).toBe('FAILED')
      expect(transaction.isFailed).toBe(true)
      expect(transaction.denialReason).toBe('Insufficient funds')
    })

    it('should throw when failing a non-pending transaction', () => {
      const transaction = makeTransaction()
      transaction.approve()

      expect(() => transaction.fail('Some reason')).toThrowError(
        InvalidArgumentError
      )
    })

    it('should update updatedAt on fail', () => {
      const transaction = makeTransaction()
      const before = transaction.updatedAt
      transaction.fail('Merchant is not active')
      expect(transaction.updatedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      )
    })
  })
})