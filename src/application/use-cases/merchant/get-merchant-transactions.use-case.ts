import type { TransactionOutputDTO } from "@/application/dtos/transaction.dto.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { PaginatedOutput, PaginationInput } from "@/shared/types/pagination.js";

export class GetMerchantTransactionsUseCase{
    constructor(private readonly transactionRepository: TransactionRepository){}

    async execute(merchantId: string, pagination: PaginationInput): Promise<PaginatedOutput<TransactionOutputDTO>>{
        const merchantIdVO = new UniqueEntityId(merchantId);
        const result = await this.transactionRepository.findAllByMerchantId(merchantIdVO, pagination);

        return {
            data: result.data.map((t) => t.toOutputDTO()),
            meta: result.meta
        }
    }
}