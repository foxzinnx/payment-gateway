export interface CreateApiKeyInputDTO {
    name: string;
}

export interface CreateApiKeyOutputDTO {
    id: string;
    name: string;
    rawKey: string;
    keyPrefix: string;
    createdAt: Date;
}

export interface ApiKeyOutputDTO {
    id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
    lastUsedAt: Date | null;
    createdAt: Date;
}