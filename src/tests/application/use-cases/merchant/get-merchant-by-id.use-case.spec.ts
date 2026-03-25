import { CreateMerchantUseCase } from "@/application/use-cases/merchant/create-merchant.use-case.js";
import { GetMerchantByIdUseCase } from "@/application/use-cases/merchant/get-merchant-by-id.use-case.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { InMemoryMerchantRepository } from "@/tests/repositories/in-memory-merchant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('GetMerchantByIdUseCase', () => {
    let repository: InMemoryMerchantRepository;
    let sut: GetMerchantByIdUseCase;
    let createUseCase: CreateMerchantUseCase;

    beforeEach(() => {
        repository = new InMemoryMerchantRepository();
        sut = new GetMerchantByIdUseCase(repository);
        createUseCase = new CreateMerchantUseCase(repository);
    });

    it('should return a merchant by id', async () => {
        const created = await createUseCase.execute({
            name: 'Empresa Exemplo LTDA',
            tradeName: 'Exemplo Store',
            email: 'contato@exemplo.com',
            cnpj: '11.222.333/0001-81',
        });

        const output = await sut.execute(created.id);

        expect(output.id).toBe(created.id);
        expect(output.name).toBe('Empresa Exemplo LTDA');
        expect(output.tradeName).toBe('Exemplo Store');
        expect(output.email).toBe('contato@exemplo.com');
        expect(output.cnpj).toBe('11.222.333/0001-81');
        expect(output.status).toBe('ACTIVE');
    });

    it('should throw NotFoundError when merchant does not exist', async () => {
        await expect(
            sut.execute('00000000-0000-0000-0000-000000000000')
        ).rejects.toThrowError(NotFoundError)
    })
})