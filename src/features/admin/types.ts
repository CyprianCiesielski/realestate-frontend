import type { Company } from "../../components/company/types.ts";

export interface AdminViewUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  companies?: Company[];
  role: string;
  canCreateProjects?: boolean;
  canDeleteProjects?: boolean;
}

export interface UserColumnData {
  id: number;
  title: string;
  users: AdminViewUser[];
}
