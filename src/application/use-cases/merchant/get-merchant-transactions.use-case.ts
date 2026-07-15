import type { TransactionOutputDTO } from "@/application/dtos/transaction.dto.js";
import type { TransactionRepository } from "@/domain/repositories/transaction.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class GetMerchantTransactionsUseCase{
    constructor(private readonly transactionRepository: TransactionRepository){}

    async execute(merchantId: string): Promise<TransactionOutputDTO[]>{
        const merchantIdVO = new UniqueEntityId(merchantId);
        const transactions = await this.transactionRepository.findAllByMerchantId(merchantIdVO);

        return transactions.map((transaction) => transaction.toOutputDTO());
    }
}