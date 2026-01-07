import api from '../../api/axios';
import { type AdminViewUser } from './types';

export const fetchUsers = async (): Promise<AdminViewUser[]> => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const assignCompanyToUser = async (userId: number, company: string) => {
    return api.post(`/admin/users/${userId}/company`, { company });
};

// Opcjonalnie: zmiana roli, jeśli backend na to pozwoli
// export const changeUserRole = ...