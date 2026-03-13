import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { CPF } from "../value-objects/cpf.vo.js";
import { Email } from "../value-objects/email.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

interface CustomerProps {
    name: string;
    email: Email;
    cpf: CPF;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Customer extends Entity<CustomerProps>{
    private constructor(props: CustomerProps, id?: UniqueEntityId){
        super(props, id)
    }

    static create(
        props: {
            name: string;
            email: string;
            cpf: string;
            phone?: string | undefined;
        },
        id?: UniqueEntityId
    ): Customer {
        Customer.validateName(props.name);

        const now = new Date();

        return new Customer(
            {
                name: props.name.trim(),
                email: Email.create(props.email),
                cpf: CPF.create(props.cpf),
                phone: props.phone?.trim() ?? null,
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    static reconstitute(props: CustomerProps, id: UniqueEntityId): Customer {
        return new Customer(props, id);
    }

    get name(): string { return this.props.name }
    get email(): Email { return this.props.email }
    get cpf(): CPF { return this.props.cpf }
    get phone(): string | null { return this.props.phone }
    get createdAt(): Date { return this.props.createdAt }
    get updatedAt(): Date { return this.props.updatedAt }

    updateName(name: string): void {
        Customer.validateName(name);
        this.props.name = name.trim();
        this.props.updatedAt = new Date()
    }

    updateEmail(email: string): void {
        this.props.email = Email.create(email);
        this.props.updatedAt = new Date();
    }

    updatePhone(phone: string): void {
        this.props.phone = phone?.trim() ?? null;
        this.props.updatedAt = new Date();
    }

    private static validateName(name: string): void {
        if(!name || name.trim().length < 3){
            throw new InvalidArgumentError('Customer name must have at least 3 characters');
        }
        if (name.trim().length > 100) {
            throw new InvalidArgumentError('Customer name must have at most 100 characters')
        }
    }
}