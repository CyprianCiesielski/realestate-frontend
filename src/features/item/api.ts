import type { Item } from "./types.ts";
import apiClient from "../../api/axios.ts";

export type CreateItemDto = Omit<Item, "id" | "historyEntries" | "tags">;

export const createItem = async (
  projectId: string,
  pillarId: string,
  data: CreateItemDto,
): Promise<Item> => {
  const response = await apiClient.post<Item>(
    `/projects/${projectId}/pillars/${pillarId}/items`,
    data,
  );

  return response.data; // Zwracamy Item
};

export const getItemById = async (
  projectId: string,
  pillarId: string,
  itemId: string,
): Promise<Item> => {
  const response = await apiClient.get<Item>(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}`,
  );
  return response.data;
};

export const updateItem = async (
  projectId: string,
  pillarId: string,
  itemId: number,
  data: CreateItemDto,
): Promise<Item> => {
  const response = await apiClient.put<Item>(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}`,
    data,
  );
  return response.data;
};

export const archiveItem = async (
  projectId: string,
  pillarId: string,
  itemId: number,
): Promise<void> => {
  await apiClient.put(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/archive`,
  );
};
