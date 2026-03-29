import { describe, it, expect, beforeEach } from 'vitest'
import { GetCustomerByIdUseCase } from '@/application/use-cases/customer/get-customer-by-id.use-case.js'
import { InMemoryCustomerRepository } from '@/tests/repositories/in-memory-customer.repository.js'
import { Customer } from '@/domain/entities/customer.entity.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'

describe('GetCustomerByIdUseCase', () => {
  let repository: InMemoryCustomerRepository
  let sut: GetCustomerByIdUseCase

  beforeEach(() => {
    repository = new InMemoryCustomerRepository()
    sut = new GetCustomerByIdUseCase(repository)
  })

  it('should return a customer by id', async () => {
    const customer = await Customer.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })
    await repository.save(customer)

    const output = await sut.execute(customer.id.value)

    expect(output.id).toBe(customer.id.value)
    expect(output.name).toBe('John Doe')
  })

  it('should throw NotFoundError when customer does not exist', async () => {
    await expect(
      sut.execute('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrowError(NotFoundError)
  })
})