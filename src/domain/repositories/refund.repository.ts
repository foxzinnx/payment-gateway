import type { Refund } from "../entities/refund.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface RefundRepository {
    findById(id: UniqueEntityId): Promise<Refund | null>;
    findByTransactionId(transactionId: UniqueEntityId): Promise<Refund | null>;
    save(refund: Refund): Promise<void>;
}