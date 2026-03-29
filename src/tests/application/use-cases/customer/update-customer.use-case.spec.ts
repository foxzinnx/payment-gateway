import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateCustomerUseCase } from '@/application/use-cases/customer/update-customer.use-case.js'
import { InMemoryCustomerRepository } from '@/tests/repositories/in-memory-customer.repository.js'
import { Customer } from '@/domain/entities/customer.entity.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { EmailAlreadyInUseError } from '@/domain/errors/email-already-in-use.error.js'

describe('UpdateCustomerUseCase', () => {
  let repository: InMemoryCustomerRepository
  let sut: UpdateCustomerUseCase

  beforeEach(() => {
    repository = new InMemoryCustomerRepository()
    sut = new UpdateCustomerUseCase(repository)
  })

  it('should update customer name', async () => {
    const customer = await Customer.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })
    await repository.save(customer)

    const output = await sut.execute(customer.id.value, { name: 'John Updated' })
    expect(output.name).toBe('John Updated')
  })

  it('should update customer email', async () => {
    const customer = await Customer.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })
    await repository.save(customer)

    const output = await sut.execute(customer.id.value, {
      email: 'newemail@example.com',
    })
    expect(output.email).toBe('newemail@example.com')
  })

  it('should throw if new email is already in use by another customer', async () => {
    const jane = await Customer.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      cpf: '651.636.600-47',
      password: 'senha123',
    })
    await repository.save(jane)

    const john = await Customer.create({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '769.193.330-40',
      password: 'senha123',
    })
    await repository.save(john)

    await expect(
      sut.execute(john.id.value, { email: 'jane@example.com' })
    ).rejects.toThrowError(EmailAlreadyInUseError)
  })

  it('should throw NotFoundError when customer does not exist', async () => {
    await expect(
      sut.execute('00000000-0000-0000-0000-000000000000', { name: 'New Name' })
    ).rejects.toThrowError(NotFoundError)
  })
})