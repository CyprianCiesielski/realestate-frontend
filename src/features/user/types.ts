export interface UserProjectAccess {
    projectId: number;
    projectName: string;
    permissions: string[]; 
}

export interface UserDetailData {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    company: string | null;
    role: string;
    assignedProjects: UserProjectAccess[];
}