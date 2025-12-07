import apiClient from "../../api/axios";
import type { Tag } from "./types.ts";

export const getAllTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>("/tags");
  return response.data;
};

export const createTag = async (name: string): Promise<Tag> => {
  const response = await apiClient.post<Tag>("/tags", { name });
  return response.data;
};
