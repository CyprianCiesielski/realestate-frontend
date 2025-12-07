import type { ItemHistory } from "../itemHistory/types.ts";
import type { Tag } from "../tag/types.ts";

export interface Item {
  id: number;
  name: string;
  status: string;
  state: string;
  description?: string;
  deadline?: string;
  startDate: string;
  priority: number;

  historyEntries: ItemHistory[];
  tags: Tag[];
}
