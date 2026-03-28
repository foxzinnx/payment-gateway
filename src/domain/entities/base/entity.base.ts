import { UniqueEntityId } from "../../value-objects/unique-entity-id.vo.js";

export abstract class Entity<TProps>{
    protected readonly _id: UniqueEntityId
    protected _props: TProps

    constructor(props: TProps, id?: UniqueEntityId){
        this._id = id ?? new UniqueEntityId();
        this._props = props;
    }

    get id(): UniqueEntityId {
        return this._id
    }

    equals(other: Entity<TProps>): boolean {
        return this._id.equals(other._id);
    }
}