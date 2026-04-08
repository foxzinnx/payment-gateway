import { Merchant } from "@/domain/entities/merchant.entity.js";
import { CNPJ } from "@/domain/value-objects/cnpj.vo.js";
import { Email } from "@/domain/value-objects/email.vo.js";
import { Password } from "@/domain/value-objects/password.vo.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import type { MerchantStatus, Merchant as PrismaMerchant } from "../../../../../generated/prisma/client.js";

export class MerchantMapper {
    static toDomain(raw: PrismaMerchant): Merchant {
        return Merchant.reconstitute(
            {
                name: raw.name,
                tradeName: raw.tradeName,
                email: Email.create(raw.email),
                password: Password.createFromHash(raw.password),
                cnpj: CNPJ.create(raw.cnpj),
                refreshToken: raw.refreshToken,
                status: raw.status as MerchantStatus,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(merchant: Merchant){
        return {
            id: merchant.id.value,
            name: merchant.name,
            tradeName: merchant.tradeName,
            email: merchant.email.value,
            password: merchant.password.value,
            cnpj: merchant.cnpj.value,
            refreshToken: merchant.refreshToken,
            status: merchant.status,
            createdAt: merchant.createdAt,
            updatedAt: merchant.updatedAt,
        }
    }
}