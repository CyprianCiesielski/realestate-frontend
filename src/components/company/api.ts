import apiClient from "../../api/axios";
import type { Company, CreateCompanyDto } from "./types.ts";

export const getAllCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get<Company[]>("/companies");
  return response.data;
};

export const getCompanyById = async (id: number): Promise<Company> => {
  const response = await apiClient.get<Company>(`/companies/${id}`);
  return response.data;
};

export const createCompany = async (
  data: CreateCompanyDto,
): Promise<Company> => {
  const response = await apiClient.post<Company>("/companies", data);
  return response.data;
};

export const updateCompany = async (
  id: number,
  data: CreateCompanyDto,
): Promise<Company> => {
  const response = await apiClient.put<Company>(`/companies/${id}`, data);
  return response.data;
};

export const archiveCompany = async (id: number): Promise<void> => {
  await apiClient.put(`/companies/${id}/archive`);
};
