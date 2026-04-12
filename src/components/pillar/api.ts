import type { Pillar } from "./types.ts";
import apiClient from "../../api/axios.ts";

export type CreatePillarDto = Omit<Pillar, "id" | "items" | "tags">;

export const createPillar = async (
  projectId: string,
  data: CreatePillarDto,
): Promise<Pillar> => {
  const response = await apiClient.post<Pillar>(
    `/projects/${projectId}/pillars`,
    data,
  );
  return response.data;
};

export const updatePillar = async (
  projectId: string,
  pillarId: number,
  data: CreatePillarDto,
): Promise<Pillar> => {
  const response = await apiClient.put<Pillar>(
    `/projects/${projectId}/pillars/${pillarId}`, // Adres: /projects/1/pillars/5
    data,
  );
  return response.data;
};

export const archivePillar = async (
  projectId: string,
  pillarId: number,
): Promise<void> => {
  // 1. Sprawdź, czy używasz PUT
  // 2. Sprawdź, czy URL jest poprawnie złożony z argumentów funkcji
  await apiClient.put(`/projects/${projectId}/pillars/${pillarId}/archive`);
};

export const getPillarById = async (
  projectId: string,
  pillarId: string,
): Promise<Pillar> => {
  const response = await apiClient.get<Pillar>(
    `/projects/${projectId}/pillars/${pillarId}`,
  );
  return response.data;
};

export const unarchivePillar = async (
  projectId: string | number,
  pillarId: number,
): Promise<void> => {
  await apiClient.put(`/projects/${projectId}/pillars/${pillarId}/unarchive`);
};
