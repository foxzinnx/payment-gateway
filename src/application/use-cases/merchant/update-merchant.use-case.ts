import type { MerchantOutputDTO, UpdateMerchantInputDTO } from "@/application/dtos/merchant.dto.js";
import type { Merchant } from "@/domain/entities/merchant.entity.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import { NotFoundError } from "@/domain/errors/not-found.error.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class UpdateMerchantUseCase{
    constructor(private readonly merchantRepository: MerchantRepository){}

    async execute(id: string, input: UpdateMerchantInputDTO): Promise<MerchantOutputDTO>{
        const merchant = await this.merchantRepository.findById(
            new UniqueEntityId(id)
        );

        if(!merchant){
            throw new NotFoundError('Merchant');
        }

        if(input.email && input.email !== merchant.email.value){
            const existingByEmail = await this.merchantRepository.findByEmail(input.email);
            if(existingByEmail){
                throw new EmailAlreadyInUseError();
            }
            merchant.updateEmail(input.email);
        }

        if(input.tradeName){
            merchant.updateTradeName(input.tradeName);
        }

        await this.merchantRepository.update(merchant);

        return merchant.toOutputDTO();
    }
}