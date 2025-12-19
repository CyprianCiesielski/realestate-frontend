export interface User{
    email: string;
    role: 'ADMIN' | 'USER';
    sub: string; //email w JWT
    exp: number;
}

export interface LoginResponse{
    token: string;
}