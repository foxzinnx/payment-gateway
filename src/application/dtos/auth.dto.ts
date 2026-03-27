export interface RegisterCustomerInputDTO {
    name: string;
    email: string;
    cpf: string;
    password: string;
    phone?: string;
}

export interface RegisterMerchantInputDTO {
    name: string;
    tradeName: string;
    email: string;
    cnpj: string;
    password: string;
}

export interface LoginInputDTO {
    email: string;
    password: string;
}

export interface AuthOutputDTO {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
    }
}

export interface RefreshTokenInputDTO {
    refreshToken: string;
}

export interface RefreshTokenOutputDTO {
    accessToken: string;
    refreshToken: string;
}