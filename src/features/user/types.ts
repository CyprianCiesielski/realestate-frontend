export interface UserProjectAccess {
    projectId: number;
    projectName: string;
    permissions: string[]; 
}

export interface UserDetailData {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    company: string | null;
    role: string;
    assignedProjects: UserProjectAccess[];
}