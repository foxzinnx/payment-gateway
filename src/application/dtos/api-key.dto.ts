export interface ApiKeyOutputDTO {
    id: string;
    name: string;
    keyPrefix: string;
    isActive: boolean;
    lastUsedAt: Date | null;
    createdAt: Date;
}