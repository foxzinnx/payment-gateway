import type { MerchantStatus } from "../../domain/entities/merchant.entity.js";

export interface CreateMerchantInputDTO {
    name: string;
    tradeName: string;
    email: string;
    cnpj: string;
}

export interface UpdateMerchantInputDTO {
    tradeName?: string;
    email?: string;
}

export interface MerchantOutputDTO {
    id: string;
    name: string;
    tradeName: string;
    email: string;
    cnpj: string;
    status: MerchantStatus;
    createdAt: Date;
    updatedAt: Date;
}