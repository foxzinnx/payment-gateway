import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { CPF } from "../value-objects/cpf.vo.js";
import { Email } from "../value-objects/email.vo.js";
import { Password } from "../value-objects/password.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

interface CustomerProps {
    name: string;
    email: Email;
    cpf: CPF;
    password: Password;
    phone: string | null;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Customer extends Entity<CustomerProps>{
    private constructor(props: CustomerProps, id?: UniqueEntityId){
        super(props, id)
    }

    static async create(
        props: {
            name: string;
            email: string;
            cpf: string;
            password: string;
            phone?: string | undefined;
        },
        id?: UniqueEntityId
    ): Promise<Customer> {
        Customer.validateName(props.name);

        const now = new Date();

        return new Customer(
            {
                name: props.name.trim(),
                email: Email.create(props.email),
                cpf: CPF.create(props.cpf),
                password: await Password.createFromPlain(props.password),
                phone: props.phone?.trim() ?? null,
                refreshToken: null,
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    static reconstitute(props: CustomerProps, id: UniqueEntityId): Customer {
        return new Customer(props, id);
    }

    get name(): string { return this._props.name }
    get email(): Email { return this._props.email }
    get cpf(): CPF { return this._props.cpf }
    get password(): Password { return this._props.password }
    get phone(): string | null { return this._props.phone }
    get refreshToken(): string | null { return this._props.refreshToken }
    get createdAt(): Date { return this._props.createdAt }
    get updatedAt(): Date { return this._props.updatedAt }

    updateName(name: string): void {
        Customer.validateName(name);
        this._props.name = name.trim();
        this._props.updatedAt = new Date()
    }

    updateEmail(email: string): void {
        this._props.email = Email.create(email);
        this._props.updatedAt = new Date();
    }

    updatePhone(phone: string | null): void {
        this._props.phone = phone?.trim() ?? null;
        this._props.updatedAt = new Date();
    }

    setRefreshToken(token: string | null): void {
        this._props.refreshToken = token;
        this._props.updatedAt = new Date();
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