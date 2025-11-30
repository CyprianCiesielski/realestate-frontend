import apiClient from "../../api/axios";
import type { Project } from "./types"; // Importujemy naszego klienta

export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get<Project[]>("/projects");
  return response.data;
};

export const getProjectById = async (id: string): Promise<Project> => {
  const response = await apiClient.get<Project>(`/projects/${id}`);
  return response.data;
};

// Typ pomocniczy: To są dane, które wysyłamy (Projekt bez ID i bez Filarów)
// Backend sam nada ID i sam stworzy domyślne filary.
export type CreateProjectDto = Omit<Project, "id" | "pillars">;

export const createProject = async (
  data: CreateProjectDto,
): Promise<Project> => {
  const response = await apiClient.post<Project>("/projects", data);
  return response.data;
};

export const updateProject = async (
  id: number,
  data: CreateProjectDto,
): Promise<Project> => {
  const response = await apiClient.put<Project>(`/projects/${id}`, data);
  return response.data;
};

export const archiveProject = async (id: number): Promise<void> => {
  await apiClient.put(`/projects/${id}/archive`);
};
