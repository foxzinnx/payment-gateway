import type { CreateMerchantInputDTO, MerchantOutputDTO } from "@/application/dtos/merchant.dto.js";
import { Merchant } from "@/domain/entities/merchant.entity.js";
import { CNPJAlreadyInUse } from "@/domain/errors/cnpj-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import type { IMerchantRepository } from "@/domain/repositories/merchant.repository.js";

export class CreateMerchantUseCase {
    constructor(private readonly merchantRepository: IMerchantRepository){}

    async execute(input: CreateMerchantInputDTO): Promise<MerchantOutputDTO>{
        const existingByEmail = await this.merchantRepository.findByEmail(input.email);
        if(existingByEmail){
            throw new EmailAlreadyInUseError();
        }

        const existingByCnpj = await this.merchantRepository.findByCnpj(input.cnpj);
        if(existingByCnpj){
            throw new CNPJAlreadyInUse();
        }

        const merchant = Merchant.create({
            name: input.name,
            tradeName: input.tradeName,
            email: input.email,
            cnpj: input.cnpj
        });

        await this.merchantRepository.save(merchant);

        return this.toOutput(merchant);
    }

    private toOutput(merchant: Merchant): MerchantOutputDTO {
        return {
            id: merchant.id.value,
            name: merchant.name,
            tradeName: merchant.tradeName,
            email: merchant.email.value,
            cnpj: merchant.cnpj.formatted,
            status: merchant.status,
            createdAt: merchant.createdAt,
            updatedAt: merchant.updatedAt,
        }
    }
}