// features/search/types.ts

// 1. Kryteria wyszukiwania (to co wysyłamy do backendu)
export interface SearchCriteria {
  name?: string;
  tags?: string[];
  createdAfter?: string;
  createdBefore?: string;
  priority?: number;
  projectId?: string;
  pillarId?: string;
}

// 2. 👇 TO JEST BRAKUJĄCY INTERFEJS (Wynik z API / DTO z Javy)
export interface GlobalSearchResultDto {
  projects: ProjectDto[];
  pillars: PillarDto[];
  items: ItemDto[];
}

// DTO pomocnicze (odzwierciedlają strukturę JSON z backendu)
export interface ProjectDto {
  id: number;
  name: string;
}

export interface PillarDto {
  id: number;
  name: string;
  // Struktura zagnieżdżona, bo w api.ts odwołujesz się do p.project?.name
  project?: {
    id: number;
    name: string;
  };
}

export interface ItemDto {
  id: number;
  name: string;
  // Struktura zagnieżdżona, bo w api.ts odwołujesz się do i.pillar.project?.name
  pillar?: {
    id: number;
    name: string;
    project?: {
      id: number;
      name: string;
    };
  };
}

// 3. Wynik dla Modala (płaska struktura)
export interface SearchResult {
  id: number;
  name: string;
  type: "project" | "pillar" | "item" | "message";
  parentName?: string;

  projectId?: number;
  pillarId?: number;
}
