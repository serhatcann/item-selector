import { Item } from "./item.model";

export interface Folder {
  id: number;
  title: string;
  parent_id: number | null;
  children?: (Folder | Item)[];
  expanded: boolean;
  selectedState: 'none' | 'partial' | 'all';
}
