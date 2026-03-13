import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { CNPJ } from "../value-objects/cnpj.vo.js";
import { Email } from "../value-objects/email.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

export type MerchantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

interface MerchantProps {
    name: string;
    tradeName: string;
    email: Email;
    cnpj: CNPJ;
    status: MerchantStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Merchant extends Entity<MerchantProps>{
    private constructor(props: MerchantProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(
        props: {
            name: string;
            tradeName: string;
            email: string;
            cnpj: string
        },
        id?: UniqueEntityId
    ): Merchant {
        Merchant.validateName(props.name);
        Merchant.validateName(props.tradeName);

        const now = new Date();

        return new Merchant(
            {
                name: props.name.trim(),
                tradeName: props.tradeName.trim(),
                email: Email.create(props.email),
                cnpj: CNPJ.create(props.cnpj),
                status: 'ACTIVE',
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    static reconstitute(props: MerchantProps, id?: UniqueEntityId): Merchant {
        return new Merchant(props, id);
    }

    get name(): string {
        return this.props.name
    }
    get tradeName(): string {
        return this.props.tradeName
    }
    get email(): Email {
        return this.props.email
    }
    get cnpj(): CNPJ {
        return this.props.cnpj
    }
    get status(): MerchantStatus {
        return this.props.status
    }
    get createdAt(): Date {
        return this.props.createdAt
    }
    get updatedAt(): Date {
        return this.props.updatedAt
    }
    get isActive(): boolean {
        return this.props.status === 'ACTIVE'
    }

    activate(): void {
        if(this.props.status === 'ACTIVE') return;
        this.props.status = 'ACTIVE';
        this.props.updatedAt = new Date();
    }

    suspend(): void {
        if(this.props.status === 'INACTIVE'){
            throw new InvalidArgumentError('Cannot suspend an inactive merchant');
        }
        this.props.status = 'SUSPENDED'
        this.props.updatedAt = new Date();
    }

    deactivate(): void {
        this.props.status = 'INACTIVE';
        this.props.updatedAt = new Date();
    }

    updateTradeName(tradeName: string): void {
        Merchant.validateName(tradeName);
        this.props.tradeName = tradeName.trim();
        this.props.updatedAt = new Date();
    }

    updateEmail(email: string): void {
        this.props.email = Email.create(email);
        this.props.updatedAt = new Date();
    }

    private static validateName(name: string): void {
        if(!name || name.trim().length < 3){
            throw new InvalidArgumentError('Name must have at least 3 characters');
        }
        if(name.trim().length > 100){
            throw new InvalidArgumentError('Name must have at most 100 characters');
        }
    }
}