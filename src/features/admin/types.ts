export interface AdminViewUser {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    company: string | null;
    role: string;
}

export interface UserColumnData{
    id: number;
    title: string;
    users: AdminViewUser[];
}
