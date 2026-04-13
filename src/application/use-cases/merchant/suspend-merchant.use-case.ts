import type { MerchantOutputDTO } from "@/application/dtos/merchant.dto.js";
import type { Merchant } from "@/domain/entities/merchant.entity.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class SuspendMerchantUseCase{
    constructor(private readonly merchantRepository: MerchantRepository){}

    async execute(id: string): Promise<MerchantOutputDTO>{
        const merchant = await this.merchantRepository.findById(
            new UniqueEntityId(id)
        )

        if(!merchant){
            throw new NotFoundError('Merchant');
        }

        merchant.suspend();

        await this.merchantRepository.update(merchant);

        return merchant.toOutputDTO();
    }
}