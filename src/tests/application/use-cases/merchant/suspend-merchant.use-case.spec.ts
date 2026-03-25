import { CreateMerchantUseCase } from "@/application/use-cases/merchant/create-merchant.use-case.js"
import { SuspendMerchantUseCase } from "@/application/use-cases/merchant/suspend-merchant.use-case.js"
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js"
import { NotFoundError } from "@/domain/errors/not-found.error.js"
import { InMemoryMerchantRepository } from "@/tests/repositories/in-memory-merchant.repository.js"
import { beforeEach, describe, expect, it } from "vitest"

describe('SuspendMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: SuspendMerchantUseCase
  let createUseCase: CreateMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new SuspendMerchantUseCase(repository)
    createUseCase = new CreateMerchantUseCase(repository)
  })

  it('should suspend an active merchant', async () => {
    const created = await createUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    const output = await sut.execute(created.id)

    expect(output.status).toBe('SUSPENDED')
    expect(repository.items[0]?.isActive).toBe(false)
  })

  it('should throw InvalidArgumentError when suspending an inactive merchant', async () => {
    const created = await createUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    repository.items[0]?.deactivate()

    await expect(sut.execute(created.id)).rejects.toThrowError(
      InvalidArgumentError
    )
  })

  it('should throw NotFoundError when merchant does not exist', async () => {
    await expect(
      sut.execute('00000000-0000-0000-0000-000000000000')
    ).rejects.toThrowError(NotFoundError)
  })
})