import bcrypt from "bcryptjs";
import { InvalidArgumentError } from "../errors/invalid-argument.error.js";

export class Password{
    private readonly _hashed: string
    private readonly _isHashed: boolean;

    private constructor(value: string, isHashed: boolean){
        this._hashed = value;
        this._isHashed = isHashed
    }

    static async createFromPlain(plain: string): Promise<Password>{
        Password.validate(plain);
        const hashed = await bcrypt.hash(plain, 10);
        return new Password(hashed, true);
    }

    static createFromHash(hash: string): Password {
        return new Password(hash, true);
    }

    async compare(plain: string): Promise<boolean> {
        return bcrypt.compare(plain, this._hashed)
    }

    get value(): string {
        return this._hashed
    }

    private static validate(plain: string): void {
        if(!plain || plain.length < 6) {
            throw new InvalidArgumentError('Password must have at least 6 characters');
        }
        if(plain.length > 100){
            throw new InvalidArgumentError('Password must have at most 100 characters');
        }
    }
}