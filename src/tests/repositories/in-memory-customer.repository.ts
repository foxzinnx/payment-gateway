import type { Customer } from "@/domain/entities/customer.entity.js";
import type { ICustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

export class InMemoryCustomerRepository implements ICustomerRepository {
    public items: Customer[] = [];
    
    async findById(id: UniqueEntityId): Promise<Customer | null> {
        return this.items.find((c) => c.id.equals(id)) ?? null;
    }
    async findByEmail(email: string): Promise<Customer | null> {
        return this.items.find((c) => c.email.value === email) ?? null;
    }
    async findByCpf(cpf: string): Promise<Customer | null> {
        const digits = cpf.replace(/\D/g, '');
        return this.items.find((c) => c.cpf.value === digits) ?? null;
    }

    async save(customer: Customer): Promise<void> {
        this.items.push(customer);
    }
    
    async update(customer: Customer): Promise<void> {
        const index = this.items.findIndex((c) => c.id.equals(customer.id));
        if(index >= 0) this.items[index] = customer;
    }

}