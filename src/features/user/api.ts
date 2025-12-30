import api from '../../api/axios';
import { type UserDetailData } from './types';

export const fetchUserDetails = async (userId: string): Promise<UserDetailData> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
};

export const grantUserPermissions = async (userId: number, projectId: number, permissionsList: string[]) => {
    return api.post(`/admin/users/${userId}/permissions`, {
        projectId,
        grantedPermissions: permissionsList
    });
};