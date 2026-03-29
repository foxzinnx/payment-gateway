import { describe, it, expect, beforeEach } from 'vitest'
import { RegisterCustomerUseCase } from '@/application/use-cases/auth/register-customer.use-case.js'
import { InMemoryCustomerRepository } from '@/tests/repositories/in-memory-customer.repository.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { CPFAlreadyInUseError } from '@/domain/errors/cpf-already-in-use.error.js'
import { EmailAlreadyInUseError } from '@/domain/errors/email-already-in-use.error.js'

describe('RegisterCustomerUseCase', () => {
  let repository: InMemoryCustomerRepository
  let sut: RegisterCustomerUseCase

  beforeEach(() => {
    repository = new InMemoryCustomerRepository()
    sut = new RegisterCustomerUseCase(repository)
  })

  it('should register a customer and return tokens', async () => {
    const output = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    expect(output.accessToken).toBeDefined()
    expect(output.refreshToken).toBeDefined()
    expect(output.user.name).toBe('John Doe')
    expect(output.user.email).toBe('john@example.com')
    expect(repository.items).toHaveLength(1)
  })

  it('should save refresh token on customer after register', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    expect(repository.items[0]?.refreshToken).not.toBeNull()
  })

  it('should throw if email is already in use', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    await expect(
      sut.execute({
        name: 'Jane Doe',
        email: 'john@example.com',
        cpf: '275.484.389-40',
        password: 'senha123',
      })
    ).rejects.toThrowError(EmailAlreadyInUseError)
  })

  it('should throw if CPF is already in use', async () => {
    await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    await expect(
      sut.execute({
        name: 'Jane Doe',
        email: 'jane@example.com',
        cpf: '529.982.247-25',
        password: 'senha123',
      })
    ).rejects.toThrowError(CPFAlreadyInUseError)
  })
})