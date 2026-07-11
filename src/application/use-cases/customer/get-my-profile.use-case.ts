import type { CustomerOutputDTO } from "@/application/dtos/customer.dto.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetMyProfileUseCase{
    constructor(private readonly customerRepository: CustomerRepository){}

    async execute(customerId: string): Promise<CustomerOutputDTO>{
        const customerIdVO = new UniqueEntityId(customerId);
        const customer = await this.customerRepository.findById(customerIdVO)
        if(!customer) throw new NotFoundError('Customer');

        return customer.toOutputDTO();
    }
}