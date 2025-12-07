import type { Pillar } from "../pillar/types";
import type { Tag } from "../tag/types.ts";

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
  tags: Tag[];
}
