import type { ItemHistory } from "../itemHistory/types.ts";
import type { Tag } from "../tag/types.ts";

export interface Item {
  id: number;
  name: string;
  deadline?: string; // '?' oznacza, że pole może być nullem (opcjonalne)
  personResponsible?: string;
  companyResposible?: string;
  state: string;
  startDate: string; // Daty z JSON przychodzą jako stringi
  priority: number;

  historyEntries: ItemHistory[];
  tags: Tag[];
}
