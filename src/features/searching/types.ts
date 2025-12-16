// 1. Importujemy Twoje istniejące typy
import type { Project } from "../project/types";
import type { Pillar } from "../pillar/types";
import type { Item } from "../item/types";

// 2. Definiujemy typy "rozszerzone" o kontekst rodzica.
//    W wynikach wyszukiwania musimy wiedzieć, gdzie dany element leży,
//    żeby zbudować link: /projects/{projectId}/pillars/{pillarId}/items/{itemId}

// Rozszerzamy Item o brakujące pole 'pillar' (zagnieżdżone w nim 'project')
export type SearchItem = Item & {
  pillar: {
    id: number;
    project: {
      id: number;
    };
  };
};

// Rozszerzamy Pillar o brakujące pole 'project'
export type SearchPillar = Pillar & {
  project: {
    id: number;
  };
};

// 3. Główny typ wyniku wyszukiwania
export interface GlobalSearchResult {
  projects: Project[]; // Projekt jest korzeniem, nie potrzebuje rodzica
  pillars: SearchPillar[]; // Używamy wersji z kontekstem
  items: SearchItem[]; // Używamy wersji z kontekstem
}

// 4. Parametry zapytania (to co wysyłasz do backendu)
export interface SearchCriteria {
  name?: string;
  tagName?: string;
  createdAfter?: string;
  createdBefore?: string;
  priority?: number;
}
