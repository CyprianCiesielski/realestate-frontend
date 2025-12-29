export interface UserAuth{
    email: string;
    role: 'ADMIN' | 'USER';
    sub: string; //email w JWT
    exp: number;
    initial: string;
}

export interface LoginResponse{
    token: string;
}