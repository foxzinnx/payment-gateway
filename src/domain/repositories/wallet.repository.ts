import type { Wallet } from "../entities/wallet.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface WalletRepository {
    findById(id: UniqueEntityId): Promise<Wallet | null>;
    findByOwnerId(ownerId: UniqueEntityId): Promise<Wallet | null>;
    save(wallet: Wallet): Promise<void>;
    update(wallet: Wallet): Promise<void>;
}