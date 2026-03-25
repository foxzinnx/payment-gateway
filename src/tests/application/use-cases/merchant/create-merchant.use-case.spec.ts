import { CreateMerchantUseCase } from '@/application/use-cases/merchant/create-merchant.use-case.js'
import { CNPJAlreadyInUse } from '@/domain/errors/cnpj-already-in-use.error.js'
import { EmailAlreadyInUseError } from '@/domain/errors/email-already-in-use.error.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { describe, it, expect, beforeEach } from 'vitest'

describe('CreateMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: CreateMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new CreateMerchantUseCase(repository)
  })

  it('should create a merchant successfully', async () => {
    const output = await sut.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    expect(output.id).toBeDefined()
    expect(output.name).toBe('Empresa Exemplo LTDA')
    expect(output.tradeName).toBe('Exemplo Store')
    expect(output.email).toBe('contato@exemplo.com')
    expect(output.cnpj).toBe('11.222.333/0001-81')
    expect(output.status).toBe('ACTIVE')
    expect(repository.items).toHaveLength(1)
  })

  it('should throw if email is already in use', async () => {
    await sut.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    await expect(
      sut.execute({
        name: 'Outra Empresa LTDA',
        tradeName: 'Outra Store',
        email: 'contato@exemplo.com',
        cnpj: '26.330.795/0001-60',
      })
    ).rejects.toThrowError(EmailAlreadyInUseError)
  })

  it('should throw if CNPJ is already in use', async () => {
    await sut.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    await expect(
      sut.execute({
        name: 'Outra Empresa LTDA',
        tradeName: 'Outra Store',
        email: 'outro@exemplo.com',
        cnpj: '11.222.333/0001-81',
      })
    ).rejects.toThrowError(CNPJAlreadyInUse)
  })
})