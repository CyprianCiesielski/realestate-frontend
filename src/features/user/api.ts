import api from '../../api/axios';
import { type UserDetailData } from './types';

export const fetchUserDetails = async (userId: string): Promise<UserDetailData> => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
};