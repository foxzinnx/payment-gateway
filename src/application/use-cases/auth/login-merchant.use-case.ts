import type { AuthOutputDTO, LoginInputDTO } from "@/application/dtos/auth.dto.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import type { IMerchantRepository } from "@/domain/repositories/merchant.repository.js";
import { tokenService } from "@/infra/services/token.service.js";

export class LoginMerchantUseCase{
    constructor(private readonly merchantRepository: IMerchantRepository){}

    async execute(input: LoginInputDTO): Promise<AuthOutputDTO>{
        const merchant = await this.merchantRepository.findByEmail(input.email);
        if(!merchant){
            throw new UnauthorizedError('Invalid credentials');
        }

        const passwordMatch = await merchant.password.compare(input.password);

        if(!passwordMatch){
            throw new UnauthorizedError('Invalid credentials');
        }

        const accessToken = tokenService.generateAccessToken({
            sub: merchant.id.value,
            type: 'MERCHANT'
        });

        const refreshToken = tokenService.generateRefreshToken({
            sub: merchant.id.value,
            type: 'MERCHANT'
        });

        merchant.setRefreshToken(refreshToken);
        
        await this.merchantRepository.update(merchant);

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