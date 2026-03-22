import type { Item } from "../item/types";
import type { Tag } from "../tag/types.ts";
import type { Company } from "../company/types.ts"; // 👈 Importujemy typ Company

export interface Pillar {
  id: number;
  name: string;
  // ZMIANA: Obiekt zamiast stringa
  company?: Company;
  deadline: string;
  state: string;
  startDate: string;
  priority: number;

  items: Item[];
  tags: Tag[];
  driveFolderLink?: string;
}
