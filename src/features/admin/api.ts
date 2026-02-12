import apiClient from "../../api/axios";
import { type AdminViewUser } from "./types";

export const fetchUsers = async (): Promise<AdminViewUser[]> => {
  const response = await apiClient.get("/admin/users");
  return response.data;
};

// 👇 ZMIANA TUTAJ: companyIds zamiast company string
export const assignCompanyToUser = async (
  userId: number,
  companyIds: number[],
) => {
  // Wysyłamy obiekt JSON: { "companyIds": [1, 2, 5] }
  return apiClient.post(`/admin/users/${userId}/company`, { companyIds });
};
