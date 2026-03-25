import { CreateMerchantUseCase } from "@/application/use-cases/merchant/create-merchant.use-case.js";
import { UpdateMerchantUseCase } from "@/application/use-cases/merchant/update-merchant.use-case.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { InMemoryMerchantRepository } from "@/tests/repositories/in-memory-merchant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('UpdateMerchantUseCase', () => {
  let repository: InMemoryMerchantRepository
  let sut: UpdateMerchantUseCase
  let createUseCase: CreateMerchantUseCase

  beforeEach(() => {
    repository = new InMemoryMerchantRepository()
    sut = new UpdateMerchantUseCase(repository)
    createUseCase = new CreateMerchantUseCase(repository)
  })

  it('should update trade name correctly', async () => {
    const created = await createUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    const output = await sut.execute(created.id, {
      tradeName: 'New Trade Name',
    })

    expect(output.tradeName).toBe('New Trade Name')
  })

  it('should update email correctly', async () => {
    const created = await createUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    const output = await sut.execute(created.id, {
      email: 'novo@exemplo.com',
    })

    expect(output.email).toBe('novo@exemplo.com')
  })

  it('should not update email if it is the same as current', async () => {
    const created = await createUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '11.222.333/0001-81',
    })

    const output = await sut.execute(created.id, {
      email: 'contato@exemplo.com',
    })

    expect(output.email).toBe('contato@exemplo.com')
  })

  it('should throw if new email is already in use by another merchant', async () => {
    await createUseCase.execute({
      name: 'Outra Empresa LTDA',
      tradeName: 'Outra Store',
      email: 'outro@exemplo.com',
      cnpj: '48.309.817/0001-72',
    })

    const created = await createUseCase.execute({
      name: 'Empresa Exemplo LTDA',
      tradeName: 'Exemplo Store',
      email: 'contato@exemplo.com',
      cnpj: '05.405.539/0001-44',
    })

    await expect(
      sut.execute(created.id, { email: 'outro@exemplo.com' })
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