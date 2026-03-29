import { describe, it, expect, beforeEach } from 'vitest'
import { GetTransactionByIdUseCase } from '@/application/use-cases/transaction/get-transaction-by-id.use-case.js'
import { InMemoryTransactionRepository } from '@/tests/repositories/in-memory-transaction.repository.js'
import { Transaction } from '@/domain/entities/transaction.entity.js'
import { UniqueEntityId } from '@/domain/value-objects/unique-entity-id.vo.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'

describe('GetTransactionByIdUseCase', () => {
  let repository: InMemoryTransactionRepository
  let sut: GetTransactionByIdUseCase

  beforeEach(() => {
    repository = new InMemoryTransactionRepository()
    sut = new GetTransactionByIdUseCase(repository)
  })

  it('should return a transaction by id', async () => {
    const transaction = Transaction.create({
      customerId: new UniqueEntityId(),
      merchantId: new UniqueEntityId(),
      amountInCents: 5000,
    })
    await repository.save(transaction)

    const output = await sut.execute(transaction.id.value)

    expect(output.id).toBe(transaction.id.value)
    expect(output.amountInCents).toBe(5000)
    expect(output.status).toBe('PENDING')
  })

  it('should return approved transaction with correct status', async () => {
    const transaction = Transaction.create({
      customerId: new UniqueEntityId(),
      merchantId: new UniqueEntityId(),
      amountInCents: 5000,
    })
    transaction.approve()
    await repository.save(transaction)

    const output = await sut.execute(transaction.id.value)

    expect(output.status).toBe('APPROVED')
  })

  it('should return failed transaction with denial reason', async () => {
    const transaction = Transaction.create({
      customerId: new UniqueEntityId(),
      merchantId: new UniqueEntityId(),
      amountInCents: 5000,
    })
    transaction.fail('Insufficient funds')
    await repository.save(transaction)

    const output = await sut.execute(transaction.id.value)

    expect(output.status).toBe('FAILED')
    expect(output.denialReason).toBe('Insufficient funds')
  })

  it('should throw NotFoundError when transaction does not exist', async () => {
    await expect(
      sut.execute('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrowError(NotFoundError)
  })
})