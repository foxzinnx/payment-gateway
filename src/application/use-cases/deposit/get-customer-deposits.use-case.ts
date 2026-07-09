import type { DepositOutputDTO } from "@/application/dtos/deposit.dto.js";
import type { DepositRepository } from "@/domain/repositories/deposit.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetCustomerDepositsUseCase {
    constructor(private readonly depositRepository: DepositRepository){}

    async execute(customerId: string): Promise<DepositOutputDTO[]>{
        const customerIdVO = new UniqueEntityId(customerId);

        const deposits = await this.depositRepository.findAllByCustomerId(customerIdVO);

        return deposits.map((deposit) => deposit.toOutputDTO());
    }
}