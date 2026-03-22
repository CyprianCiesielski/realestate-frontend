import apiClient from "../../api/axios";
import type { ItemHistory } from "./types";

export type CreateHistoryDto = {
  webViewLink?: string;
  googleFileId?: string;
  description: string;
  author: string;
};

export const getItemHistoryByItemId = async (
  projectId: string,
  pillarId: string,
  itemId: string,
): Promise<ItemHistory[]> => {
  const response = await apiClient.get<ItemHistory[]>(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/history`,
  );
  return response.data;
};

export const addHistoryEntry = async (
  projectId: string,
  pillarId: string,
  itemId: string,
  data: CreateHistoryDto,
): Promise<ItemHistory> => {
  const response = await apiClient.post<ItemHistory>(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/history`,
    data,
    {
      // 👇 DODAJ TĘ KONFIGURACJĘ - to wymusza na przeglądarce informację: "Wysyłam JSON"
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

export const updateItemHistory = async (
  projectId: string,
  pillarId: string,
  itemId: string,
  id: number,
  data: CreateHistoryDto,
): Promise<ItemHistory> => {
  const response = await apiClient.put<ItemHistory>(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/history/${id}`,
    data,
  );
  return response.data;
};

export const pinItemHistory = async (
  projectId: string,
  pillarId: string,
  itemId: string,
  id: number,
): Promise<void> => {
  await apiClient.put(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/history/${id}/pin`,
  );
};

export const archiveItemHistory = async (
  projectId: string,
  pillarId: string,
  itemId: string,
  id: number,
): Promise<void> => {
  await apiClient.put(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/history/${id}/archive`,
  );
};

export const addReaction = async (
  projectId: string,
  pillarId: string,
  itemId: string,
  historyId: number,
  emoji: string,
): Promise<ItemHistory> => {
  const response = await apiClient.post<ItemHistory>(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/history/${historyId}/reactions`,
    { emojiCode: emoji },
  );
  return response.data;
};

export const uploadFileToItemHistory = async (
  projectId: string,
  pillarId: string,
  itemId: string,
  file: File,
  description: string,
): Promise<ItemHistory> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description);

  const response = await apiClient.post<ItemHistory>(
    `/projects/${projectId}/pillars/${pillarId}/items/${itemId}/files`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

export const getProjectPinnedHistory = async (
  projectId: string,
): Promise<ItemHistory[]> => {
  const response = await apiClient.get<ItemHistory[]>(
    `/projects/${projectId}/pinned-history`,
  );
  return response.data;
};

export const getPillarPinnedHistory = async (
  projectId: string,
  pillarId: string,
): Promise<ItemHistory[]> => {
  const response = await apiClient.get<ItemHistory[]>(
    `/projects/${projectId}/pillars/${pillarId}/pinned-history`,
  );
  return response.data;
};
