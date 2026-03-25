import { CreateCustomerUseCase } from "@/application/use-cases/customer/create-customer.use-case.js";
import { GetCustomerByIdUseCase } from "@/application/use-cases/customer/get-customer-by-id.use-case.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('GetCustomerByIdUseCase', () => {
    let repository: InMemoryCustomerRepository;
    let sut: GetCustomerByIdUseCase;
    let createUseCase: CreateCustomerUseCase;

    beforeEach(() => {
        repository = new InMemoryCustomerRepository();
        sut = new GetCustomerByIdUseCase(repository);
        createUseCase = new CreateCustomerUseCase(repository);
    });

    it('should return a customer by id', async () => {
        const created = await createUseCase.execute({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25',
        });

        const output = await sut.execute(created.id);

        expect(output.id).toBe(created.id);
        expect(output.name).toBe('John Doe');
    });

    it('should throw NotErrorFound when customer does not exist', async () => {
        await expect(
            sut.execute('00000000-0000-0000-0000-000000000000')
        ).rejects.toThrowError(NotFoundError);
    });
})