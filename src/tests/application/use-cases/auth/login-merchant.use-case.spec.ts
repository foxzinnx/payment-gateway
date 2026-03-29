import { describe, it, expect, beforeEach } from 'vitest'
import { LoginMerchantUseCase } from '@/application/use-cases/auth/login-merchant.use-case.js'
import { RegisterMerchantUseCase } from '@/application/use-cases/auth/register-merchant.use-case.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { UnauthorizedError } from '@/domain/errors/unauthorized.error.js'

describe('LoginMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: LoginMerchantUseCase
  let registerUseCase: RegisterMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new LoginMerchantUseCase(repository)
    registerUseCase = new RegisterMerchantUseCase(repository)
  })

  it('should login and return tokens', async () => {
    await registerUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    const output = await sut.execute({
      email: 'contato@exemplo.com',
      password: 'senha123',
    })

    expect(output.accessToken).toBeDefined()
    expect(output.refreshToken).toBeDefined()
    expect(output.user.email).toBe('contato@exemplo.com')
  })

  it('should update refresh token on each login', async () => {
    await registerUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    const firstLogin = await sut.execute({
      email: 'contato@exemplo.com',
      password: 'senha123',
    })

    const secondLogin = await sut.execute({
      email: 'contato@exemplo.com',
      password: 'senha123',
    })

    expect(firstLogin.refreshToken).not.toBe(secondLogin.refreshToken)
  })

  it('should throw UnauthorizedError for wrong password', async () => {
    await registerUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    await expect(
      sut.execute({ email: 'contato@exemplo.com', password: 'wrong-password' })
    ).rejects.toThrowError(UnauthorizedError)
  })

  it('should throw UnauthorizedError for non-existent email', async () => {
    await expect(
      sut.execute({ email: 'notfound@exemplo.com', password: 'senha123' })
    ).rejects.toThrowError(UnauthorizedError)
  })
})