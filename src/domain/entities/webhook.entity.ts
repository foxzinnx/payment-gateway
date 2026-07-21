import type { WebhookOutputDTO } from "@/application/dtos/webhook.dto.js";
import { InvalidArgumentError } from "../errors/invalid-argument.error.js";
import type { UniqueEntityId } from "../value-objects/unique-entity-id.vo.js";
import type { WebhookEvent } from "../webhooks/webhook-event.js";
import { Entity } from "./base/entity.base.js";

interface WebhookProps {
    merchantId: UniqueEntityId;
    url: string;
    events: WebhookEvent[];
    secret: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Webhook extends Entity<WebhookProps>{
    private constructor(props: WebhookProps, id?: UniqueEntityId){
        super(props, id);
    }

    static create(props: Omit<WebhookProps, 'isActive' | 'createdAt' | 'updatedAt'>, id?: UniqueEntityId): Webhook {
        Webhook.validateUrl(props.url);
        Webhook.validateEvents(props.events);

        const now = new Date();

        return new Webhook(
            {
                merchantId: props.merchantId,
                url: props.url.trim(),
                events: props.events,
                secret: props.secret,
                isActive: true,
                createdAt: now,
                updatedAt: now
            },
            id
        )
    }

    static reconstitute(props: WebhookProps, id: UniqueEntityId): Webhook {
        return new Webhook(props, id);
    }

    get merchantId(): UniqueEntityId { return this._props.merchantId };
    get url(): string { return this._props.url };
    get events(): WebhookEvent[] { return this._props.events };
    get secret(): string { return this._props.secret };
    get isActive(): boolean { return this._props.isActive };
    get createdAt(): Date { return this._props.createdAt };
    get updatedAt(): Date { return this._props.updatedAt }

    deactivate(): void {
        this._props.isActive = false;
        this._props.updatedAt = new Date();
    }

    activate(): void {
        this._props.isActive = true;
        this._props.updatedAt = new Date();
    }

    listensTo(event: WebhookEvent): boolean {
        return this._props.events.includes(event);
    }

    toOutputDTO(): WebhookOutputDTO {
        return {
            id: this.id.value,
            merchantId: this._props.merchantId.value,
            url: this._props.url,
            events: this._props.events,
            isActive: this._props.isActive,
            createdAt: this._props.createdAt,
            updatedAt: this._props.updatedAt
        }
    }

    private static validateUrl(url: string): void {
        try {
            const parsed = new URL(url);
            if(!['http:', 'https:'].includes(parsed.protocol)){
                throw new InvalidArgumentError('Webhook URL must use HTTP or HTTPS')
            }
        } catch {
            throw new InvalidArgumentError(`Invalid webhook URL: ${url}`)
        }
    }

    private static validateEvents(events: WebhookEvent[]): void {
        if(events.length === 0){
            throw new InvalidArgumentError('At least one event must be specified')
        }
    }
}