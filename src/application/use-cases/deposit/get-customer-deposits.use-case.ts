import type { DepositOutputDTO } from "@/application/dtos/deposit.dto.js";
import type { DepositRepository } from "@/domain/repositories/deposit.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { PaginatedOutput, PaginationInput } from "@/shared/types/pagination.js";

export class GetCustomerDepositsUseCase {
    constructor(private readonly depositRepository: DepositRepository){}

    async execute(customerId: string, pagination: PaginationInput): Promise<PaginatedOutput<DepositOutputDTO>>{
        const customerIdVO = new UniqueEntityId(customerId);

        const result = await this.depositRepository.findAllByCustomerId(customerIdVO, pagination);

        return {
            data: result.data.map((d) => d.toOutputDTO()),
            meta: result.meta
        };
    }
}