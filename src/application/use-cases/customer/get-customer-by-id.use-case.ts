import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { CustomerOutputDTO } from "../../dtos/customer.dto.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { Customer } from "@/domain/entities/customer.entity.js";

export class GetCustomerByIdUseCase {
    constructor(private readonly customerRepository: CustomerRepository){}

    async execute(id: string): Promise<CustomerOutputDTO>{
        const customer = await this.customerRepository.findById(
            new UniqueEntityId(id)
        )

        if(!customer){
            throw new NotFoundError('Customer');
        }

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
            updatedAt: customer.updatedAt,
        }
    }
}