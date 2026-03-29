import { describe, it, expect, beforeEach } from 'vitest'
import { SuspendMerchantUseCase } from '@/application/use-cases/merchant/suspend-merchant.use-case.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { Merchant } from '@/domain/entities/merchant.entity.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'
import { InvalidArgumentError } from '@/domain/errors/invalid-argument.error.js'

describe('SuspendMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: SuspendMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new SuspendMerchantUseCase(repository)
  })

  it('should suspend an active merchant', async () => {
    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    await repository.save(merchant)

    const output = await sut.execute(merchant.id.value)

    expect(output.status).toBe('SUSPENDED')
    expect(repository.items[0]?.isActive).toBe(false)
  })

  it('should throw InvalidArgumentError when suspending an inactive merchant', async () => {
    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    await repository.save(merchant)

    repository.items[0]?.deactivate()

    await expect(sut.execute(merchant.id.value)).rejects.toThrowError(
      InvalidArgumentError
    )
  })

  it('should throw NotFoundError when merchant does not exist', async () => {
    await expect(
      sut.execute('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrowError(NotFoundError)
  })
})