import type { Company } from "../../components/company/types.ts";

export interface AdminViewUser {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  companies?: Company[];
  role: string;
}

export interface UserColumnData {
  id: number;
  title: string;
  users: AdminViewUser[];
}
