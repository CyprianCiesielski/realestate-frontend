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
