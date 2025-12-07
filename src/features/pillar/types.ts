import type { Item } from "../item/types";
import type { Tag } from "../tag/types.ts";

export interface Pillar {
  id: number;
  name: string;
  state: string;
  startDate: string;
  priority: number;

  items: Item[];
  tags: Tag[];
}
