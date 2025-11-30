import type { Pillar } from "../pillar/types";

export interface Project {
  id: number;
  name: string;
  place?: string; // '?' oznacza, że pole może być nullem (opcjonalne)
  contractor?: string;
  companyResposible?: string;
  state: string;
  startDate: string; // Daty z JSON przychodzą jako stringi
  priority: number;

  pillars: Pillar[];
}
