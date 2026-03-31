import apiClient from "../../api/axios";
import type {
  SearchCriteria,
  FilterCriteria,
  GlobalSearchResultDto,
  SearchResult,
} from "./types";

// --- 1. Funkcja pomocnicza: Konwersja DTO z backendu na płaską listę ---
const transformToSearchResults = (
  data: GlobalSearchResultDto,
): SearchResult[] => {
  const results: SearchResult[] = [];

  // Projekty
  // 👇 ZMIANA: Dodano ?. (optional chaining) dla bezpieczeństwa
  data.projects?.forEach((p) => {
    results.push({
      id: p.id,
      name: p.name,
      type: "project",
      url: `/projects/${p.id}`,
    });
  });

  // Filary (Moduły)
  data.pillars?.forEach((p) => {
    results.push({
      id: p.id,
      name: p.name,
      type: "pillar",
      parentName: p.project?.name,
      projectId: p.project?.id || p.projectId,
      url: p.project ? `/projects/${p.project.id}/pillars/${p.id}` : "#",
    });
  });

  // Itemy (Wątki)
  data.items?.forEach((i) => {
    const projectId = i.pillar?.project?.id || i.projectId;
    const pillarId = i.pillar?.id || i.pillarId;

    results.push({
      id: i.id,
      name: i.name,
      type: "item",
      parentName: i.pillar
        ? `${i.pillar.project?.name || ""} > ${i.pillar.name}`
        : undefined,
      projectId: projectId,
      pillarId: pillarId,
      url:
        projectId && pillarId
          ? `/projects/${projectId}/pillars/${pillarId}/items/${i.id}`
          : "#",
    });
  });

  return results;
};

// --- 2. Główne zapytanie do API ---
export const searchGlobal = async (
  params: SearchCriteria,
): Promise<GlobalSearchResultDto> => {
  const response = await apiClient.get<GlobalSearchResultDto>("/search", {
    params,
  });
  return response.data;
};

// --- 3. Wyszukiwanie z Filtrowaniem (dla SearchPage) ---
export const searchGlobalWithFilter = async (
  searchParams: SearchCriteria,
  filterParams: FilterCriteria,
): Promise<GlobalSearchResultDto> => {
  const requestParams = {
    name: searchParams.name,
    projectId: searchParams.projectId,
    pillarId: searchParams.pillarId,

    filterByProject: filterParams.filterByProject,
    filterByPillar: filterParams.filterByPillar,
    filterByItem: filterParams.filterByItem,

    filteredTagsNames: filterParams.filteredTagsNames?.join(","),
    filteredPriority: filterParams.filteredPriority,

    companyId: filterParams.companyId,
    filteredStates: filterParams.filteredStates?.join(","),
  };

  const response = await apiClient.get<GlobalSearchResultDto>(
    "/search/filter",
    {
      params: requestParams,
    },
  );

  return response.data;
};

// --- 4. Funkcje kontekstowe (dla SearchModal) ---

export const searchInProject = async (
  projectId: string,
  query: string,
): Promise<SearchResult[]> => {
  const rawData = await searchGlobal({
    name: query,
    projectId: projectId,
  });
  return transformToSearchResults(rawData);
};

export const searchInPillar = async (
  pillarId: string,
  query: string,
): Promise<SearchResult[]> => {
  const rawData = await searchGlobal({
    name: query,
    pillarId: pillarId,
  });
  return transformToSearchResults(rawData);
};

export const searchInItem = async (
  _itemId: string,
  _query: string,
): Promise<SearchResult[]> => {
  // Tutaj backend jeszcze nie obsługuje szukania w komentarzach
  console.warn("API: Wyszukiwanie wewnątrz itemu nie zaimplementowane.");
  return [];
};
