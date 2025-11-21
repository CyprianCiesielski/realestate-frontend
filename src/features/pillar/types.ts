import type { Item } from "../item/types";

export interface Pillar {
  id: number;
  name: string;
  state: string;
  startDate: string;

  items: Item[];
}
