import { describe, it, expect, beforeEach } from 'vitest'
import { RefreshTokenMerchantUseCase } from '@/application/use-cases/auth/refresh-token-merchant.use-case.js'
import { RegisterMerchantUseCase } from '@/application/use-cases/auth/register-merchant.use-case.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { UnauthorizedError } from '@/domain/errors/unauthorized.error.js'

describe('RefreshTokenMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: RefreshTokenMerchantUseCase
  let registerUseCase: RegisterMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new RefreshTokenMerchantUseCase(repository)
    registerUseCase = new RegisterMerchantUseCase(repository)
  })

  it('should return new tokens with valid refresh token', async () => {
    const registered = await registerUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
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
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
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
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    await sut.execute({ refreshToken: first.refreshToken })

    await expect(
      sut.execute({ refreshToken: first.refreshToken })
    ).rejects.toThrowError(UnauthorizedError)
  })
})