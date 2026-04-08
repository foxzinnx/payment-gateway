import type { AuthOutputDTO, RegisterCustomerInputDTO } from "@/application/dtos/auth.dto.js";
import { Customer } from "@/domain/entities/customer.entity.js";
import { CPFAlreadyInUseError } from "@/domain/errors/cpf-already-in-use.error.js";
import { EmailAlreadyInUseError } from "@/domain/errors/email-already-in-use.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import { tokenService } from "@/infra/services/token.service.js";

export class RegisterCustomerUseCase {
    constructor(private readonly customerRepository: CustomerRepository){}

    async execute(input: RegisterCustomerInputDTO): Promise<AuthOutputDTO>{
        const existingByEmail = await this.customerRepository.findByEmail(input.email);
        if(existingByEmail){
            throw new EmailAlreadyInUseError();
        }

        const existingByCpf = await this.customerRepository.findByCpf(input.cpf);
        if(existingByCpf){
            throw new CPFAlreadyInUseError();
        }

        const customer = await Customer.create({
            name: input.name,
            email: input.email,
            cpf: input.cpf,
            password: input.password,
            phone: input.phone
        });

        const accessToken = tokenService.generateAccessToken({
            sub: customer.id.value,
            type: 'CUSTOMER'
        });

        const refreshToken = tokenService.generateRefreshToken({
            sub: customer.id.value,
            type: 'CUSTOMER'
        });

        customer.setRefreshToken(refreshToken);

        await this.customerRepository.save(customer);

        return {
            accessToken,
            refreshToken,
            user: {
                id: customer.id.value,
                name: customer.name,
                email: customer.email.value,
            }
        }
    }
}