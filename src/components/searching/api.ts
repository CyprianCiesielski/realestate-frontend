import apiClient from "../../api/axios";

import type {
  SearchCriteria,
  GlobalSearchResultDto,
  SearchResult,
} from "./types";

export type { SearchCriteria, GlobalSearchResultDto, SearchResult };

// --- Funkcja pomocnicza: Konwersja DTO z backendu na listę dla Modala ---
const transformToSearchResults = (
  data: GlobalSearchResultDto,
): SearchResult[] => {
  const results: SearchResult[] = [];

  // Mapowanie Projektów
  data.projects.forEach((p) => {
    results.push({
      id: p.id,
      name: p.name,
      type: "project",
    });
  });

  // Mapowanie Filarów
  data.pillars.forEach((p) => {
    results.push({
      id: p.id,
      name: p.name,
      type: "pillar",
      parentName: p.project?.name, // Kontekst: nazwa projektu

      projectId: p.project?.id,
    });
  });

  // Mapowanie Itemów
  data.items.forEach((i) => {
    results.push({
      id: i.id,
      name: i.name,
      type: "item",
      // Kontekst: Filar > Projekt
      parentName: i.pillar
        ? `${i.pillar.project?.name || ""} > ${i.pillar.name}`
        : undefined,

      projectId: i.pillar?.project?.id,
      pillarId: i.pillar?.id,
    });
  });

  return results;
};

// --- Główne zapytanie do API ---
export const searchGlobal = async (
  params: SearchCriteria,
): Promise<GlobalSearchResultDto> => {
  // Serializacja tablicy tagów (axios standardowo robi tags[]=a&tags[]=b, Spring woli tags=a,b lub powtarzane klucze)
  // apiClient zazwyczaj obsługuje to dobrze, ale upewnij się, że backend to czyta.
  const response = await apiClient.get<GlobalSearchResultDto>("/search", {
    params: params,
  });
  return response.data;
};

// --- Funkcje dedykowane dla ScopedSearchModal ---

// 1. Szukaj w konkretnym PROJEKCIE
export const searchInProject = async (
  projectId: string,
  query: string,
): Promise<SearchResult[]> => {
  const rawData = await searchGlobal({
    name: query,
    projectId: projectId, // Backend zawęzi wyniki do tego projektu
  });
  return transformToSearchResults(rawData);
};

// 2. Szukaj w konkretnym FILARZE
export const searchInPillar = async (
  pillarId: string,
  query: string,
): Promise<SearchResult[]> => {
  const rawData = await searchGlobal({
    name: query,
    pillarId: pillarId, // Backend zawęzi wyniki do tego filaru (zwróci itemy)
  });
  return transformToSearchResults(rawData);
};

export const searchInItem = async (
  _itemId: string,
  _query: string,
): Promise<SearchResult[]> => {
  console.warn(
    "Wyszukiwanie w wiadomościach wymaga endpointu backendowego /api/search/history",
  );
  return [];
};

// --- Filtrowanie (z Twojego oryginalnego pliku) ---
export const filterGlobalSearch = async (
  searchParams: SearchCriteria,
  filterParams: {
    filterByProject?: boolean;
    filterByPillar?: boolean;
    filterByItem?: boolean;
    filteredTagsNames?: string[];
    filteredPriority?: number;
  },
): Promise<GlobalSearchResultDto> => {
  // Mapowanie parametrów filtra na strukturę backendu
  const backendFilterParams = {
    ...searchParams,
    // Backend oczekuje SearchingCriteria + FilteringCriteria
    // Upewnij się, że nazwy pól się zgadzają z FilteringCriteria w Javie
    filterByProject: filterParams.filterByProject,
    filterByPillar: filterParams.filterByPillar,
    filterByItem: filterParams.filterByItem,
    filteredTagsNames: filterParams.filteredTagsNames,
    filteredPriority: filterParams.filteredPriority,
  };

  const response = await apiClient.get<GlobalSearchResultDto>(
    "/search/filter",
    {
      params: backendFilterParams,
    },
  );

  return response.data;
};
