export interface PaginationInput {
    page: number;
    limit: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedOutput<T> {
    data: T[];
    meta: PaginationMeta;
}

export function buildMeta(
    total: number,
    input: PaginationInput
): PaginationMeta {
    return {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit)
    }
}