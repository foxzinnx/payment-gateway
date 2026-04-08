import type { AuthOutputDTO, RegisterMerchantInputDTO } from "@/application/dtos/auth.dto.js";
import { Merchant } from "@/domain/entities/merchant.entity.js";
import { CNPJAlreadyInUseError } from "@/domain/errors/cnpj-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import { tokenService } from "@/infra/services/token.service.js";

export class RegisterMerchantUseCase {
    constructor(private readonly merchantRepository: MerchantRepository){}

    async execute(input: RegisterMerchantInputDTO): Promise<AuthOutputDTO> {
        const existingByEmail = await this.merchantRepository.findByEmail(input.email);
        if(existingByEmail){
            throw new EmailAlreadyInUseError();
        }

        const existingByCnpj = await this.merchantRepository.findByCnpj(input.cnpj);
        if(existingByCnpj){
            throw new CNPJAlreadyInUseError();
        }

        const merchant = await Merchant.create({
            name: input.name,
            tradeName: input.tradeName,
            email: input.email,
            password: input.password,
            cnpj: input.cnpj
        });

        const accessToken = tokenService.generateAccessToken({
            sub: merchant.id.value,
            type: 'MERCHANT'
        });

        const refreshToken = tokenService.generateRefreshToken({
            sub: merchant.id.value,
            type: 'MERCHANT'
        });

        merchant.setRefreshToken(refreshToken);

        await this.merchantRepository.save(merchant);

        return {
            accessToken,
            refreshToken,
            user: {
                id: merchant.id.value,
                name: merchant.name,
                email: merchant.email.value
            }
        }
    }
}