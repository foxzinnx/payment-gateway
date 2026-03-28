export interface CreateCustomerInputDTO {
    name: string;
    email: string;
    cpf: string;
    phone?: string | undefined;
}

export interface UpdateCustomerInputDTO {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
}

export interface CustomerOutputDTO {
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
}

