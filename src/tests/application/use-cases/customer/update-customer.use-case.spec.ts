import { CreateCustomerUseCase } from "@/application/use-cases/customer/create-customer.use-case.js";
import { UpdateCustomerUseCase } from "@/application/use-cases/customer/update-customer.use-case.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { InvalidArgumentError } from "@/domain/errors/invalid-argument.error.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('UpdateCustomerUseCase', () => {
    let repository: InMemoryCustomerRepository;
    let sut: UpdateCustomerUseCase;
    let createUseCase: CreateCustomerUseCase;

    beforeEach(() => {
        repository = new InMemoryCustomerRepository();
        sut = new UpdateCustomerUseCase(repository);
        createUseCase = new CreateCustomerUseCase(repository);
    });

    it('should update customer name', async () => {
        const created = await createUseCase.execute({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25'
        });

        const output = await sut.execute(created.id, { name: 'John Updated' });
        expect(output.name).toBe('John Updated');
    });

    it('should update customer email', async () => {
        const created = await createUseCase.execute({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25'
        });

        const output = await sut.execute(created.id, { email: 'newemail@gmail.com' });
        expect(output.email).toBe('newemail@gmail.com');
    });

    it('should throw if new email is already in use by another customer', async () => {
        await createUseCase.execute({
            name: 'Jane Doe',
            email: 'jane@example.com',
            cpf: '211.137.560-80'
        });

        const john = await createUseCase.execute({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '020.172.170-85'
        });

        await expect(
            sut.execute(john.id, { email: 'jane@example.com'})
        ).rejects.toThrowError(EmailAlreadyInUseError);
    });

    it('should throw NotFoundError when customer does not exist', async () => {
        await expect(
            sut.execute('00000000-0000-0000-0000-000000000000', { name: 'New Name' })
        ).rejects.toThrowError(NotFoundError);
    })
})