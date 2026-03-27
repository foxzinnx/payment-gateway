import type { AuthOutputDTO, LoginInputDTO } from "@/application/dtos/auth.dto.js";
import { UnauthorizedError } from "@/domain/errors/unauthorized.error.js";
import type { ICustomerRepository } from "@/domain/repositories/customer.repository.js";
import { tokenService } from "@/infra/services/token.service.js";

export class LoginCustomerUseCase{
    constructor(private readonly customerRepository: ICustomerRepository){}

    async execute(input: LoginInputDTO): Promise<AuthOutputDTO>{
        const customer = await this.customerRepository.findByEmail(input.email);
        if(!customer){
            throw new UnauthorizedError('Invalid credentials');
        }

        const passwordMatch = await customer.password.compare(input.password);

        if(!passwordMatch){
            throw new UnauthorizedError('Invalid credentials');
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
            refreshToken,
            user: {
                id: customer.id.value,
                name: customer.name,
                email: customer.email.value
            }
        }
    }
}