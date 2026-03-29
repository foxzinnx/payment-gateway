import { describe, it, expect, beforeEach } from 'vitest'
import { RegisterMerchantUseCase } from '@/application/use-cases/auth/register-merchant.use-case.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { CNPJAlreadyInUseError } from '@/domain/errors/cnpj-already-in-use.error.js'
import { EmailAlreadyInUseError } from '@/domain/errors/email-already-in-use.error.js'

describe('RegisterMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: RegisterMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new RegisterMerchantUseCase(repository)
  })

  it('should register a merchant and return tokens', async () => {
    const output = await sut.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    expect(output.accessToken).toBeDefined()
    expect(output.refreshToken).toBeDefined()
    expect(output.user.name).toBe('Empresa Exemplo LTDA')
    expect(output.user.email).toBe('contato@exemplo.com')
    expect(repository.items).toHaveLength(1)
  })

  it('should save refresh token on merchant after register', async () => {
    await sut.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    expect(repository.items[0]?.refreshToken).not.toBeNull()
  })

  it('should throw if email is already in use', async () => {
    await sut.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    await expect(
      sut.execute({
        name: 'Outra Empresa LTDA',
        tradeName: 'Outra Store',
        email: 'contato@exemplo.com',
        cnpj: '26.330.795/0001-60',
        password: 'senha123',
      })
    ).rejects.toThrowError(EmailAlreadyInUseError)
  })

  it('should throw if CNPJ is already in use', async () => {
    await sut.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })

    await expect(
      sut.execute({
        name: 'Outra Empresa LTDA',
        tradeName: 'Outra Store',
        email: 'outro@exemplo.com',
        cnpj: '11.222.333/0001-81',
        password: 'senha123',
      })
    ).rejects.toThrowError(CNPJAlreadyInUseError)
  })
})