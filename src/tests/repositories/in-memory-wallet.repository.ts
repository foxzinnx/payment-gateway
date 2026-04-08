import type { Wallet } from "@/domain/entities/wallet.entity.js";
import type { WalletRepository } from "@/domain/repositories/wallet.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class InMemoryWalletRepository implements WalletRepository{
    public items: Wallet[] = [];
    
    async findById(id: UniqueEntityId): Promise<Wallet | null> {
        return this.items.find((w) => w.id.equals(id)) ?? null;
    }

    async findByOwnerId(ownerId: UniqueEntityId): Promise<Wallet | null> {
        return this.items.find((w) => w.ownerId.equals(ownerId)) ?? null;
    }

    async save(wallet: Wallet): Promise<void> {
        this.items.push(wallet);
    }

    async update(wallet: Wallet): Promise<void> {
        const index = this.items.findIndex((w) => w.id.equals(wallet.id));
        if(index >= 0) this.items[index] = wallet;
    }

}