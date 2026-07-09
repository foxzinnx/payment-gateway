import type { DepositOutputDTO } from "@/application/dtos/deposit.dto.js";
import type { DepositRepository } from "@/domain/repositories/deposit.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetCustomerDepositsUseCase {
    constructor(private readonly depositRepository: DepositRepository){}

    async execute(customerId: UniqueEntityId): Promise<DepositOutputDTO[]>{
        const deposits = await this.depositRepository.findAllByCustomerId(customerId);

        return deposits.map((deposit) => deposit.toOutputDTO());
    }
}