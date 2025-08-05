export interface Folder {
  id: number;
  title: string;
  parent_id: number | null;
  children?: Folder[];
  items?: Item[];
  expanded?: boolean;
  selectedState?: 'none' | 'partial' | 'all';
}

export interface Item {
  id: number;
  title: string;
  folder_id: number;
  selected?: boolean;
}
