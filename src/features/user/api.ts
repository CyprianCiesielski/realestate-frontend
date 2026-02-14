import api from "../../api/axios";
import { type UserDetailData } from "./types";

export const fetchUserDetails = async (
  userId: string,
): Promise<UserDetailData> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const grantUserPermissions = async (
  userId: number,
  projectId: number,
  permissionsList: string[],
) => {
  return api.post(`/admin/users/${userId}/permissions`, {
    projectId,
    grantedPermissions: permissionsList,
  });
};

export const fetchMyProfile = async (): Promise<UserDetailData> => {
  // Używamy nowego endpointu, który nie wymaga uprawnień admina
  const response = await api.get("/users/me");
  return response.data;
};

export const updateMyProfile = async (data: {
  firstName: string;
  lastName: string;
  email: string;
}): Promise<UserDetailData> => {
  // Zakładam endpoint /users/me dla metody PUT
  const response = await api.put<UserDetailData>("/users/me", data);
  return response.data;
};
