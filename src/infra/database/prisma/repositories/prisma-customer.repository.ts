import type { Customer } from "@/domain/entities/customer.entity.js";
import type { ICustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { prisma } from "../prisma.client.js";
import { CustomerMapper } from "../mappers/customer.mapper.js";

export class PrismaCustomerRepository implements ICustomerRepository {
    async findById(id: UniqueEntityId): Promise<Customer | null> {
        const raw = await prisma.customer.findUnique({
            where: { id: id.value }
        });

        if(!raw) return null;

        return CustomerMapper.toDomain(raw);
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const raw = await prisma.customer.findUnique({
            where: { email }
        });

        if(!raw) return null

        return CustomerMapper.toDomain(raw);
    }

    async findByCpf(cpf: string): Promise<Customer | null> {
        const digits = cpf.replace(/\D/g, '');

        const raw = await prisma.customer.findUnique({
            where: { cpf: digits }
        });

        if(!raw) return null

        return CustomerMapper.toDomain(raw);
    }

    async save(customer: Customer): Promise<void> {
        const data = CustomerMapper.toPrisma(customer);

        await prisma.customer.create({ data });
    }

    async update(customer: Customer): Promise<void> {
        const data = CustomerMapper.toPrisma(customer);

        await prisma.customer.update({
            where: { id: data.id },
            data,
        });
    }
    
}