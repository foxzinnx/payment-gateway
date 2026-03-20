import type { Merchant } from "@/domain/entities/merchant.entity.js";
import type { IMerchantRepository } from "@/domain/repositories/merchant.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class InMemoryMerchantRepository implements IMerchantRepository {
    public items: Merchant[] = [];

    async findById(id: UniqueEntityId): Promise<Merchant | null> {
        return this.items.find((m) => m.id.equals(id)) ?? null;
    }

    async findByEmail(email: string): Promise<Merchant | null> {
        return this.items.find((m) => m.email.value === email) ?? null;
    }

    async findByCnpj(cnpj: string): Promise<Merchant | null> {
        const digits = cnpj.replace(/\D/g, '');
        return this.items.find((m) => m.cnpj.value === digits) ?? null;
    }

    async save(merchant: Merchant): Promise<void> {
        this.items.push(merchant);
    }
    
    async update(merchant: Merchant): Promise<void> {
        const index = this.items.findIndex((m) => m.id.equals(merchant.id));
        if(index >= 0) this.items[index] = merchant;
    }

}