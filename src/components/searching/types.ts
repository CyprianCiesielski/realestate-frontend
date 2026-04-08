// 1. Kryteria wyszukiwania (SearchingCriteria z Javy)
export interface SearchCriteria {
  name?: string;
  tags?: string[];
  priority?: number;
  projectId?: string;
  pillarId?: string;
  states?: string[];
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
  filteredTagsNames?: string[];
  filteredPriority?: number | null;
  companyId?: number | null;
  filteredStates?: string[];
}

// 3. Główny DTO wyniku z API
export interface GlobalSearchResultDto {
  projects: ProjectDto[];
  pillars: PillarDto[];
  items: ItemDto[];
}

// 4. DTO pomocnicze
export interface ProjectDto {
  id: number;
  name: string;
  tags?: TagDto[];
}

export interface PillarDto {
  id: number;
  name: string;
  tags?: TagDto[];
  project?: {
    id: number;
    name: string;
  };
  projectId?: number;
}

export interface ItemDto {
  id: number;
  name: string;
  tags?: TagDto[];
  priority?: number;
  pillar?: {
    id: number;
    name: string;
    project?: {
      id: number;
      name: string;
    };
  };
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
  // 👇 ZMIANA: Dodano "message", bo używasz go w SearchModal
  type: "project" | "pillar" | "item" | "message";
  parentName?: string;
  url: string;
  projectId?: number;
  pillarId?: number;
  // 👇 ZMIANA: Dodano itemId, może się przydać przy wiadomościach
  itemId?: number;
}
