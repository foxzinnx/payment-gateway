import { Customer } from "../../domain/entities/customer.entity.js";
import { CPFAlreadyInUseError } from "../../domain/errors/cpf-already-in-use.error.js";
import { EmailAlreadyInUseError } from "../../domain/errors/email-already-in-use.error.js";
import type { ICustomerRepository } from "../../domain/repositories/customer.repository.js";
import type { CreateCustomerInputDTO, CustomerOutputDTO } from "../dtos/customer.dto.js";

export class CreateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository){}

    async execute(input: CreateCustomerInputDTO): Promise<CustomerOutputDTO> {
        const existingByEmail = await this.customerRepository.findByEmail(input.email);
        if(existingByEmail){
            throw new EmailAlreadyInUseError();
        }

        const existingByCpf = await this.customerRepository.findByCpf(input.cpf);
        if(existingByCpf){
            throw new CPFAlreadyInUseError();
        }

        const customer = Customer.create({
            name: input.name,
            email: input.email,
            cpf: input.cpf,
            phone: input.phone,
        });

        await this.customerRepository.save(customer);

        return this.toOutput(customer);
    }

    private toOutput(customer: Customer): CustomerOutputDTO {
        return {
            id: customer.id.value,
            name: customer.name,
            email: customer.email.value,
            cpf: customer.cpf.formatted,
            phone: customer.phone,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt
        }
    }
}