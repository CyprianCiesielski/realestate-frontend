//import type { Company } from "../../components/company/types";

export interface UserProjectAccess {
    projectId: number;
    projectName: string;
    permissions: string[]; 
}

export interface UserDetailData {
    id: number;
    email: string;
    googleDriveEmail?: string;
    firstName: string;
    lastName: string;
    companies: string[];
    role: string;
    assignedProjects: UserProjectAccess[];
}