import { describe, it, expect, beforeEach } from 'vitest'
import { LoginCustomerUseCase } from '@/application/use-cases/auth/login-customer.use-case.js'
import { RegisterCustomerUseCase } from '@/application/use-cases/auth/register-customer.use-case.js'
import { InMemoryCustomerRepository } from '@/tests/repositories/in-memory-customer.repository.js'
import { UnauthorizedError } from '@/domain/errors/unauthorized.error.js'

describe('LoginCustomerUseCase', () => {
  let repository: InMemoryCustomerRepository
  let sut: LoginCustomerUseCase
  let registerUseCase: RegisterCustomerUseCase

  beforeEach(() => {
    repository = new InMemoryCustomerRepository()
    sut = new LoginCustomerUseCase(repository)
    registerUseCase = new RegisterCustomerUseCase(repository)
  })

  it('should login and return tokens', async () => {
    await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    const output = await sut.execute({
      email: 'john@example.com',
      password: 'senha123',
    })

    expect(output.accessToken).toBeDefined()
    expect(output.refreshToken).toBeDefined()
    expect(output.user.email).toBe('john@example.com')
  })

  it('should update refresh token on each login', async () => {
    await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    const firstLogin = await sut.execute({
      email: 'john@example.com',
      password: 'senha123',
    })

    const secondLogin = await sut.execute({
      email: 'john@example.com',
      password: 'senha123',
    })

    expect(firstLogin.refreshToken).not.toBe(secondLogin.refreshToken)
  })

  it('should throw UnauthorizedError for wrong password', async () => {
    await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    await expect(
      sut.execute({ email: 'john@example.com', password: 'wrong-password' })
    ).rejects.toThrowError(UnauthorizedError)
  })

  it('should throw UnauthorizedError for non-existent email', async () => {
    await expect(
      sut.execute({ email: 'notfound@example.com', password: 'senha123' })
    ).rejects.toThrowError(UnauthorizedError)
  })
})