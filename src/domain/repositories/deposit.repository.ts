import type { PaginatedOutput, PaginationInput } from "@/shared/types/pagination.js";
import type { Deposit } from "../entities/deposit.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface DepositRepository {
    findById(id: UniqueEntityId): Promise<Deposit | null>;
    findAllByCustomerId(customerId: UniqueEntityId, pagination: PaginationInput): Promise<PaginatedOutput<Deposit>>;
    save(deposit: Deposit): Promise<void>;
    update(deposit: Deposit): Promise<void>;
}