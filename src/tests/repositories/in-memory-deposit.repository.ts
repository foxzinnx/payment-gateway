import type { Deposit } from "@/domain/entities/deposit.entity.js";
import type { DepositRepository } from "@/domain/repositories/deposit.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { type PaginationInput, type PaginatedOutput, buildMeta } from "@/shared/types/pagination.js";

export class InMemoryDepositRepository implements DepositRepository {
    public items: Deposit[] = [];
    
    async findById(id: UniqueEntityId): Promise<Deposit | null> {
        return this.items.find((d) => d.id.equals(id)) ?? null;
    }

    async findAllByCustomerId(customerId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<Deposit>> {
        const { page, limit } = pagination;
        const filtered = this.items.filter((d) => d.customerId.equals(customerId));
        const total = filtered.length;
        const data = filtered.slice((page - 1) * limit, page * limit);

        return { data, meta: buildMeta(total, pagination) }
    }

    async save(deposit: Deposit): Promise<void> {
        this.items.push(deposit);
    }

    async update(deposit: Deposit): Promise<void> {
        const index = this.items.findIndex((d) => d.id.equals(deposit.id));
        if(index >= 0) this.items[index] = deposit;
    }

}