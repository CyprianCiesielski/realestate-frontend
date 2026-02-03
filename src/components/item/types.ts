import type { ItemHistory } from "../itemHistory/types.ts";
import type { Tag } from "../tag/types.ts";
import type { Company } from "../company/types.ts"; // 👈 Import Company

export interface Item {
  id: number;
  name: string;
  deadline?: string;
  personResponsible?: string;
  // ZMIANA: Obiekt zamiast stringa
  company?: Company;
  state: string;
  startDate: string;
  priority: number;

  historyEntries: ItemHistory[];
  tags: Tag[];
}
