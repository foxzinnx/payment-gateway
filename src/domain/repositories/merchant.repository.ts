import type { Merchant } from "../entities/merchant.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface MerchantRepository {
    findById(id: UniqueEntityId): Promise<Merchant | null>;
    findByEmail(email: string): Promise<Merchant | null>;
    findByCnpj(cnpj: string): Promise<Merchant | null>;
    save(merchant: Merchant): Promise<void>;
    update(merchant: Merchant): Promise<void>;
}