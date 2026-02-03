import type { Pillar } from "../pillar/types";
import type { Tag } from "../tag/types.ts";
import type { Company } from "../company/types.ts"; // Upewnij się, że importujesz Company

export interface Project {
  id: number;
  name: string;
  deadline?: string;
  personResponsible?: string;
  // ZMIANA: Backend zwraca teraz obiekt, a nazwa pola w Javie to "company"
  company?: Company;
  state: string;
  startDate: string;
  priority: number;

  pillars: Pillar[];
  tags: Tag[];
}
