import { CreateCustomerUseCase } from "@/application/use-cases/customer/create-customer.use-case.js";
import { CPFAlreadyInUseError } from "@/domain/errors/cpf-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { InMemoryCustomerRepository } from "@/tests/repositories/in-memory-customer.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

describe('CreateCustomerUseCase', () => {
    let repository: InMemoryCustomerRepository;
    let sut: CreateCustomerUseCase;

    beforeEach(() => {
        repository = new InMemoryCustomerRepository();
        sut = new CreateCustomerUseCase(repository);
    });

    it('should create a customer correctly', async () => {
        const output = await sut.execute({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25',
        });

        expect(output.id).toBeDefined();
        expect(output.name).toBe('John Doe');
        expect(output.email).toBe('john@example.com');
        expect(output.cpf).toBe('529.982.247-25');
        expect(repository.items).toHaveLength(1);
    });

    it('should throw if email is already in use', async () => {
        await sut.execute({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25',
        });

        await expect(
            sut.execute({
                name: 'Jane Doe',
                email: 'john@example.com',
                cpf: '529.982.247-40',
            })
        ).rejects.toThrowError(EmailAlreadyInUseError);
    });

    it('should throw if CPF is already in use', async () => {
        await sut.execute({
            name: 'John Doe',
            email: 'john@example.com',
            cpf: '529.982.247-25',
        });

        await expect(
            sut.execute({
                name: 'Jane Doe',
                email: 'john2@example.com',
                cpf: '529.982.247-25',
            })
        ).rejects.toThrowError(CPFAlreadyInUseError);
    });
})