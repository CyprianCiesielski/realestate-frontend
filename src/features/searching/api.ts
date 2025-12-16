import apiClient from "../../api/axios.ts";
import type { GlobalSearchResult, SearchCriteria } from "./types";

export const searchGlobal = async (
  params: SearchCriteria,
): Promise<GlobalSearchResult> => {
  const response = await apiClient.get<GlobalSearchResult>("/search", {
    params: params,
  });

  return response.data;
};

export const filterGlobalSearch = async (
  searchParams: SearchCriteria,
  filterParams: {
    filterByProject?: boolean;
    filterByPillar?: boolean;
    filterByItem?: boolean;
    filteredTagsNames?: string[];
    filteredPriority?: number;
  },
): Promise<GlobalSearchResult> => {
  const mergedParams = {
    ...searchParams,
    ...filterParams,
  };

  const response = await apiClient.get<GlobalSearchResult>("/search/filter", {
    params: mergedParams,
  });

  return response.data;
};
