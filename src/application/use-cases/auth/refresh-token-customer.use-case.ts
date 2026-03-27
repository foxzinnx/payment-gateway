import type { RefreshTokenInputDTO, RefreshTokenOutputDTO } from "@/application/dtos/auth.dto.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import type { ICustomerRepository } from "@/domain/repositories/customer.repository.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { tokenService } from "@/infra/services/token.service.js";

export class RefreshTokenCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository){}

    async execute(input: RefreshTokenInputDTO): Promise<RefreshTokenOutputDTO>{
        const payload = tokenService.verifyRefreshToken(input.refreshToken);

        if(payload.type !== 'CUSTOMER'){
            throw new UnauthorizedError('Invalid token type')
        }

        const customer = await this.customerRepository.findById(
            new UniqueEntityId(payload.sub)
        );

        if(!customer || customer.refreshToken !== input.refreshToken){
            throw new UnauthorizedError('Invalid refresh token')
        }

        const accessToken = tokenService.generateAccessToken({
            sub: customer.id.value,
            type: 'CUSTOMER'
        });

        const refreshToken = tokenService.generateRefreshToken({
            sub: customer.id.value,
            type: 'CUSTOMER'
        });

        customer.setRefreshToken(refreshToken);

        await this.customerRepository.update(customer);

        return {
            accessToken,
            refreshToken
        }
    }
}