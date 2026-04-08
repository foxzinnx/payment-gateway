import type { RefreshTokenInputDTO, RefreshTokenOutputDTO } from "@/application/dtos/auth.dto.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import type { MerchantRepository } from "@/domain/repositories/merchant.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { tokenService } from "@/infra/services/token.service.js";

export class RefreshTokenMerchantUseCase{
    constructor(private readonly merchantRepository: MerchantRepository){}

    async execute(input: RefreshTokenInputDTO): Promise<RefreshTokenOutputDTO> {
        const payload = tokenService.verifyRefreshToken(input.refreshToken);
        if(payload.type !== 'MERCHANT'){
            throw new UnauthorizedError('Invalid token type');
        }

        const merchant = await this.merchantRepository.findById(
            new UniqueEntityId(payload.sub)
        );

        if(!merchant || merchant.refreshToken !== input.refreshToken){
            throw new UnauthorizedError('Invalid refresh token');
        };

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
            refreshToken
        }
    }
}