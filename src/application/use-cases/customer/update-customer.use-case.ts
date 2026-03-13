import type { CustomerOutputDTO, UpdateCustomerInputDTO } from "@/application/dtos/customer.dto.js";
import type { Customer } from "@/domain/entities/customer.entity.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { ICustomerRepository } from "@/domain/repositories/customer.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class UpdateCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository){}

    async execute(id: string, input: UpdateCustomerInputDTO): Promise<CustomerOutputDTO>{
        const customer = await this.customerRepository.findById(
            new UniqueEntityId(id)
        );

        if(!customer){
            throw new NotFoundError('Customer');
        }

        if(input.email && input.email !== customer.email.value){
            const existingByEmail = await this.customerRepository.findByEmail(input.email);
            if(existingByEmail){
                throw new EmailAlreadyInUseError();
            }
            customer.updateEmail(input.email);
        }

        if(input.name){
            customer.updateName(input.name);
        }

        if(input.phone !== undefined){
            customer.updatePhone(input.phone ?? "");
        }

        await this.customerRepository.update(customer);
        
        return this.toOutput(customer);
    }

    private toOutput(customer: Customer): CustomerOutputDTO{
        return {
            id: customer.id.value,
            name: customer.name,
            email: customer.email.value,
            cpf: customer.cpf.formatted,
            phone: customer.phone,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
        }
    }
}