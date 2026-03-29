import { describe, it, expect, beforeEach } from 'vitest'
import { RefreshTokenCustomerUseCase } from '@/application/use-cases/auth/refresh-token-customer.use-case.js'
import { RegisterCustomerUseCase } from '@/application/use-cases/auth/register-customer.use-case.js'
import { InMemoryCustomerRepository } from '@/tests/repositories/in-memory-customer.repository.js'
import { UnauthorizedError } from '@/domain/errors/unauthorized.error.js'

describe('RefreshTokenCustomerUseCase', () => {
  let repository: InMemoryCustomerRepository
  let sut: RefreshTokenCustomerUseCase
  let registerUseCase: RegisterCustomerUseCase

  beforeEach(() => {
    repository = new InMemoryCustomerRepository()
    sut = new RefreshTokenCustomerUseCase(repository)
    registerUseCase = new RegisterCustomerUseCase(repository)
  })

  it('should return new tokens with valid refresh token', async () => {
    const registered = await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    const output = await sut.execute({
      refreshToken: registered.refreshToken,
    })

    expect(output.accessToken).toBeDefined()
    expect(output.refreshToken).toBeDefined()
  })

  it('should rotate refresh token on each refresh', async () => {
    const registered = await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    const output = await sut.execute({
      refreshToken: registered.refreshToken,
    })

    expect(output.refreshToken).not.toBe(registered.refreshToken)
  })

  it('should throw UnauthorizedError for invalid refresh token', async () => {
    await expect(
      sut.execute({ refreshToken: 'invalid-token' })
    ).rejects.toThrowError(UnauthorizedError)
  })

  it('should throw UnauthorizedError when refresh token does not match stored token', async () => {
    const first = await registerUseCase.execute({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '529.982.247-25',
      password: 'senha123',
    })

    // Consome o refresh token — gera um novo e invalida o anterior
    await sut.execute({ refreshToken: first.refreshToken })

    // Tenta usar o token antigo novamente
    await expect(
      sut.execute({ refreshToken: first.refreshToken })
    ).rejects.toThrowError(UnauthorizedError)
  })
})