import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCard } from '@/app/shared/components/app-card/app-card';
import { AppCheckbox } from '@/app/shared/components/app-checkbox/app-checkbox';
import { ResponseService } from '@/app/core/services/response.service';
import { Folder } from '@/app/shared/models/folder.model';
import { Item } from '@/app/shared/models/item.model';

@Component({
  selector: 'item-selector',
  imports: [CommonModule, AppCard, AppCheckbox],
  templateUrl: './item-selector.html',
})
export class ItemSelector implements OnInit {
  items: (Folder | Item)[] = [];

  constructor(
    private responseService: ResponseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.responseService.loadData().subscribe(({ folders, items }) => {
      this.items = this.buildTree(folders, items);
      this.cdr.detectChanges();
    });
  }

  private buildTree(folders: Folder[], items: Item[]): (Folder | Item)[] {
    const folderMap = new Map<number, Folder>();
    folders.forEach((folder) => {
      folder.children = [];
      folderMap.set(folder.id, folder);
    });

    items.forEach((item) => {
      const folder = folderMap.get(item.folder_id);
      if (folder) {
        folder.children!.push(item);
      }
    });

    folders.forEach((folder) => {
      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children!.push(folder);
        }
      }
    });

    return folders.filter((folder) => !folder.parent_id);
  }

  onToggleExpanded(folderId: number) {
    this.toggleFolderExpanded(this.items, folderId);
  }

  onToggleSelected(event: { id: number; type: 'folder' | 'item' }) {
    if (event.type === 'folder') {
      this.toggleFolderSelection(this.items, event.id);
    } else {
      this.toggleItemSelection(this.items, event.id);
    }
    this.updateParentStates(this.items);
    this.cdr.detectChanges();
  }

  private toggleFolderExpanded(
    items: (Folder | Item)[],
    folderId: number
  ): boolean {
    return this.findAndUpdate(items, folderId, (item) => {
      if ('children' in item) {
        item.expanded = !item.expanded;
        return true;
      }
      return false;
    });
  }

  private toggleFolderSelection(
    items: (Folder | Item)[],
    folderId: number
  ): boolean {
    return this.findAndUpdate(items, folderId, (item) => {
      if ('children' in item) {
        const newState = item.selectedState === 'all' ? 'none' : 'all';
        this.setFolderSelectionState(item, newState);
        return true;
      }
      return false;
    });
  }

  private toggleItemSelection(
    items: (Folder | Item)[],
    itemId: number
  ): boolean {
    return this.findAndUpdate(items, itemId, (item) => {
      if ('selected' in item) {
        item.selected = !item.selected;
        return true;
      }
      return false;
    });
  }

  private findAndUpdate(
    items: (Folder | Item)[],
    id: number,
    updateFn: (item: Folder | Item) => boolean
  ): boolean {
    for (const item of items) {
      if (item.id === id && updateFn(item)) return true;
      if (
        'children' in item &&
        this.findAndUpdate(item.children || [], id, updateFn)
      )
        return true;
    }
    return false;
  }

  private setFolderSelectionState(folder: Folder, state: 'none' | 'all') {
    folder.selectedState = state;
    folder.children?.forEach((child) => {
      if ('selected' in child) {
        child.selected = state === 'all';
      } else {
        this.setFolderSelectionState(child, state);
      }
    });
  }

  private updateParentStates(items: (Folder | Item)[]): void {
    items.forEach((item) => {
      if ('children' in item && item.children) {
        this.updateParentStates(item.children);

        const childItems = item.children.filter(
          (child) => 'selected' in child
        ) as Item[];
        const childFolders = item.children.filter(
          (child) => 'children' in child
        ) as Folder[];

        const allSelected =
          childItems.every((child) => child.selected) &&
          childFolders.every((child) => child.selectedState === 'all');
        const someSelected =
          childItems.some((child) => child.selected) ||
          childFolders.some((child) => child.selectedState !== 'none');

        item.selectedState =
          allSelected && item.children.length > 0
            ? 'all'
            : someSelected
            ? 'partial'
            : 'none';
      }
    });
  }
}
