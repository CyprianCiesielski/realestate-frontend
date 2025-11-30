import type { Item } from "../item/types.ts";
import apiClient from "../../api/axios.ts";

export type CreateItemDto = Omit<Item, "id" | "historyEntries">;

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
  itemId: string,
): Promise<Item> => {
  const response = await apiClient.get<Item>(
    `/projects/${projectId}/pillars/items/${itemId}`,
  ); // Zakładam, że Twoja ścieżka API to /items/{itemId}
  return response.data;
};
