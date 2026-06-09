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

export const registerNewUserAsAdmin = async (userData: any) => {
  // Wykorzystujemy publiczny endpoint rejestracji
  return apiClient.post("/auth/register", userData);
};

export const fetchAllProjectsForAdmin = async (): Promise<
  { id: number; name: string }[]
> => {
  // Zakładam, że masz taki endpoint do projektów
  const response = await apiClient.get("/projects");
  return response.data;
};

export const updateUserDetailsByAdmin = async (userId: number, data: any) => {
  // Zauważ, że używamy PUT (lub PATCH) zgodnie z tym, co ustawiliśmy w Spring Boocie
  return apiClient.put(`/admin/users/${userId}`, data);
};

export const triggerManualBackup = async () => {
  return apiClient.post("/admin/backup/create");
};

export const fetchBackupsList = async (): Promise<{id: string, name: string}[]> => {
  const response = await apiClient.get("/admin/backup/list");
  return response.data;
};

export const restoreFromBackupFile = async (fileId: string) => {
  return apiClient.post(`/admin/backup/restore?fileId=${fileId}`);
};