import apiClient from "../../api/axios";
import type { Tag, CreateTagDto } from "./types.ts";

export const getAllTags = async (): Promise<Tag[]> => {
  const response = await apiClient.get<Tag[]>("/tags");
  return response.data;
};

export const createTag = async (data: CreateTagDto): Promise<Tag> => {
  const response = await apiClient.post<Tag>("/tags", data);
  return response.data;
};
