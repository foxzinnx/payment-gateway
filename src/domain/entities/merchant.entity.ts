import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import { CNPJ } from "../value-objects/cnpj.vo.js";
import { Email } from "../value-objects/email.vo.js";
import { Password } from "../value-objects/password.vo.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import { Entity } from "./base/entity.base.js";

export type MerchantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

interface MerchantProps {
    name: string;
    tradeName: string;
    email: Email;
    password: Password;
    cnpj: CNPJ;
    status: MerchantStatus;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Merchant extends Entity<MerchantProps>{
    private constructor(props: MerchantProps, id?: UniqueEntityId){
        super(props, id);
    }

    static async create(
        props: {
            name: string;
            tradeName: string;
            email: string;
            password: string;
            cnpj: string
        },
        id?: UniqueEntityId
    ): Promise <Merchant> {
        Merchant.validateName(props.name);
        Merchant.validateName(props.tradeName);

        const now = new Date();

        return new Merchant(
            {
                name: props.name.trim(),
                tradeName: props.tradeName.trim(),
                email: Email.create(props.email),
                password: await Password.createFromPlain(props.password),
                cnpj: CNPJ.create(props.cnpj),
                status: 'ACTIVE',
                refreshToken: null,
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
        return this._props.name
    }
    get tradeName(): string {
        return this._props.tradeName
    }
    get email(): Email {
        return this._props.email
    }
    get password(): Password {
        return this._props.password
    }
    get cnpj(): CNPJ {
        return this._props.cnpj
    }
    get status(): MerchantStatus {
        return this._props.status
    }
    get refreshToken(): string | null {
        return this._props.refreshToken
    }
    get createdAt(): Date {
        return this._props.createdAt
    }
    get updatedAt(): Date {
        return this._props.updatedAt
    }
    get isActive(): boolean {
        return this._props.status === 'ACTIVE'
    }

    activate(): void {
        if(this._props.status === 'ACTIVE') return;
        this._props.status = 'ACTIVE';
        this._props.updatedAt = new Date();
    }

    suspend(): void {
        if(this._props.status === 'INACTIVE'){
            throw new InvalidArgumentError('Cannot suspend an inactive merchant');
        }
        this._props.status = 'SUSPENDED'
        this._props.updatedAt = new Date();
    }

    deactivate(): void {
        this._props.status = 'INACTIVE';
        this._props.updatedAt = new Date();
    }

    updateTradeName(tradeName: string): void {
        Merchant.validateName(tradeName);
        this._props.tradeName = tradeName.trim();
        this._props.updatedAt = new Date();
    }

    updateEmail(email: string): void {
        this._props.email = Email.create(email);
        this._props.updatedAt = new Date();
    }

    setRefreshToken(token: string | null): void {
        this._props.refreshToken = token;
        this._props.updatedAt = new Date();
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