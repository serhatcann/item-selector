import { Folder } from '../models/folder.model';
import { Item } from '../models/item.model';

export function isFolder(item: Folder | Item): item is Folder {
  return 'children' in item;
}

export function isItem(item: Folder | Item): item is Item {
  return 'selected' in item;
}
