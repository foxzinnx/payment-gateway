import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateMerchantUseCase } from '@/application/use-cases/merchant/update-merchant.use-case.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { Merchant } from '@/domain/entities/merchant.entity.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'
import { EmailAlreadyInUseError } from '@/domain/errors/email-already-in-use.error.js'

describe('UpdateMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: UpdateMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new UpdateMerchantUseCase(repository)
  })

  it('should update trade name correctly', async () => {
    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    await repository.save(merchant)

    const output = await sut.execute(merchant.id.value, {
      tradeName: 'New Trade Name',
    })

    expect(output.tradeName).toBe('New Trade Name')
  })

  it('should update email correctly', async () => {
    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    await repository.save(merchant)

    const output = await sut.execute(merchant.id.value, {
      email: 'novo@exemplo.com',
    })

    expect(output.email).toBe('novo@exemplo.com')
  })

  it('should not update email if it is the same as current', async () => {
    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    await repository.save(merchant)

    const output = await sut.execute(merchant.id.value, {
      email: 'contato@exemplo.com',
    })

    expect(output.email).toBe('contato@exemplo.com')
  })

  it('should throw if new email is already in use by another merchant', async () => {
    const other = await Merchant.create({
      name: 'Outra Empresa LTDA',
      tradeName: 'Outra Store',
      email: 'outro@exemplo.com',
      cnpj: '33.784.738/0001-46',
      password: 'senha123',
    })
    await repository.save(other)

    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '80.085.374/0001-96',
      password: 'senha123',
    })
    await repository.save(merchant)

    await expect(
      sut.execute(merchant.id.value, { email: 'outro@exemplo.com' })
    ).rejects.toThrowError(EmailAlreadyInUseError)
  })

  it('should throw NotFoundError when merchant does not exist', async () => {
    await expect(
      sut.execute('00000000-0000-0000-0000-000000000000', {
        tradeName: 'Any Name',
      })
    ).rejects.toThrowError(NotFoundError)
  })
})