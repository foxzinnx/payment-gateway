export interface CreateCustomerDTO {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
}

export interface UpdateCustomerInputDTO {
    name?: string;
    email?: string;
    phone?: string | null;
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

