import { Customer } from "@/domain/entities/customer.entity.js";
import { CPF } from "@/domain/value-objects/cpf.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { Customer as PrismaCustomer } from "generated/prisma/client.js";

export class CustomerMapper {
    static toDomain(raw: PrismaCustomer): Customer {
        return Customer.reconstitute(
            {
                name: raw.name,
                email: Email.create(raw.email),
                cpf: CPF.create(raw.cpf),
                phone: raw.phone,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(customer: Customer) {
        return {
            id: customer.id.value,
            name: customer.name,
            email: customer.email.value,
            cpf: customer.cpf.value,
            phone: customer.phone,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
        }
    }
}