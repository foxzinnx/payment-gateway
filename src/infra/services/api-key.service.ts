import crypto from 'crypto'

export interface GeneratedApiKey {
    rawKey: string;
    keyHash: string;
    keyPrefix: string;
}

export class ApiKeyService {
    generate(): GeneratedApiKey {
        const randomPart = crypto.randomBytes(32).toString('hex');
        const rawKey = `payflow_live_${randomPart}`;

        const keyHash = crypto
            .createHash('sha256')
            .update(rawKey)
            .digest('hex')

        const keyPrefix = `${rawKey.substring(0, 20)}...`

        return { rawKey, keyHash, keyPrefix }
    }

    hash(rawKey: string): string {
        return crypto.createHash('sha256').update(rawKey).digest('hex')
    }
}

export const apiKeyService = new ApiKeyService()