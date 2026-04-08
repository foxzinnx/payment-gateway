import type { Customer } from "../entities/customer.entity.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";

export interface CustomerRepository {
    findById(id: UniqueEntityId): Promise<Customer | null>;
    findByEmail(email: string): Promise<Customer | null>;
    findByCpf(cpf: string): Promise<Customer | null>;
    save(customer: Customer): Promise<void>;
    update(customer: Customer): Promise<void>;
}