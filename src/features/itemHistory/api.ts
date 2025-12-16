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
