import type { TransactionOutputDTO } from "@/application/dtos/transaction.dto.js";
import type { Transaction } from "@/domain/entities/transaction.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetTransactionByIdUseCase {
    constructor(private readonly transactionRepository: TransactionRepository){}

    async execute(id: string): Promise<TransactionOutputDTO>{
        const transaction = await this.transactionRepository.findById(
            new UniqueEntityId(id)
        );

        if(!transaction){
            throw new NotFoundError('Transaction')
        }

        return transaction.toOutputDTO();
    }
}