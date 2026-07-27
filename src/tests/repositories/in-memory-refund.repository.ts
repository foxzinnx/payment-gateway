import type { Refund } from "@/domain/entities/refund.entity.js";
import type { RefundRepository } from "@/domain/repositories/refund.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class InMemoryRefundRepository implements RefundRepository {
    public items: Refund[] = [];

    async findById(id: UniqueEntityId): Promise<Refund | null> {
        return this.items.find((r) => r.id.equals(id)) ?? null;
    }

    async findByTransactionId(transactionId: UniqueEntityId): Promise<Refund | null> {
        return (
            this.items.find((r) => r.transactionId.equals(transactionId)) ?? null
        )
    }

    async save(refund: Refund): Promise<void> {
        this.items.push(refund);
    }
}