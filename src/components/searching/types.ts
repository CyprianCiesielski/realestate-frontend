// features/search/types.ts

// 1. Kryteria wyszukiwania (SearchingCriteria z Javy)
export interface SearchCriteria {
  name?: string;
  tags?: string[]; // Tagi do wyszukiwania w bazie (opcjonalne)
  priority?: number;
  projectId?: string;
  pillarId?: string;
}

export interface CompanyDto {
  id: number;
  name: string;
}

// 2. Kryteria filtrowania (FilteringCriteria z Javy)
export interface FilterCriteria {
  filterByProject: boolean;
  filterByPillar: boolean;
  filterByItem: boolean;
  filteredTagsNames?: string[]; // Tagi do filtrowania wyników
  filteredPriority?: number | null;
  companyId?: number | null;
}

// 3. Główny DTO wyniku z API
export interface GlobalSearchResultDto {
  projects: ProjectDto[];
  pillars: PillarDto[];
  items: ItemDto[];
}

// 4. DTO pomocnicze (struktura obiektów z backendu)
export interface ProjectDto {
  id: number;
  name: string;
  tags?: TagDto[];
}

export interface PillarDto {
  id: number;
  name: string;
  tags?: TagDto[];
  // Backend zwraca zagnieżdżony projekt
  project?: {
    id: number;
    name: string;
  };
  // LUB płaskie ID (zależy od Twojego mappera), obsługujemy oba przypadki w komponencie
  projectId?: number;
}

export interface ItemDto {
  id: number;
  name: string;
  tags?: TagDto[];
  priority?: number;
  // Zagnieżdżony Filar i Projekt
  pillar?: {
    id: number;
    name: string;
    project?: {
      id: number;
      name: string;
    };
  };
  // Płaskie ID (opcjonalnie)
  pillarId?: number;
  projectId?: number;
}

export interface TagDto {
  id: number;
  name: string;
}

// 5. Spłaszczony wynik (dla SearchBar / Dropdownu)
export interface SearchResult {
  id: number;
  name: string;
  type: "project" | "pillar" | "item";
  parentName?: string;
  url: string; // Gotowy URL do przekierowania
  projectId?: number;
  pillarId?: number;
}
