import { describe, it, expect, beforeEach } from 'vitest'
import { GetMerchantByIdUseCase } from '@/application/use-cases/merchant/get-merchant-by-id.use-case.js'
import { InMemoryMerchantRepository } from '@/tests/repositories/in-memory-merchant.repository.js'
import { Merchant } from '@/domain/entities/merchant.entity.js'
import { NotFoundError } from '@/domain/errors/not-found.error.js'

describe('GetMerchantByIdUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: GetMerchantByIdUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new GetMerchantByIdUseCase(repository)
  })

  it('should return a merchant by id', async () => {
    const merchant = await Merchant.create({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
      password: 'senha123',
    })
    await repository.save(merchant)

    const output = await sut.execute(merchant.id.value)

    expect(output.id).toBe(merchant.id.value)
    expect(output.name).toBe('Empresa Exemplo LTDA')
    expect(output.tradeName).toBe('Exemplo Store')
    expect(output.status).toBe('ACTIVE')
  })

  it('should throw NotFoundError when merchant does not exist', async () => {
    await expect(
      sut.execute('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrowError(NotFoundError)
  })
})