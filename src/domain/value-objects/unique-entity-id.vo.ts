import { v4 as uuidv4 ,validate } from "uuid";
import { InvalidArgumentError } from "../errors/invalid-argument.error.js";

export class UniqueEntityId {
    private readonly _value: string;

    constructor(id?: string){
        if(id && !validate(id)){
            throw new InvalidArgumentError(`Invalid UUID: ${id}`);
        }

        this._value = id ?? uuidv4();
    }

    get value(): string {
        return this._value
    }

    equals(other: UniqueEntityId): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value
    }
}