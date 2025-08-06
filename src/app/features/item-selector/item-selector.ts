import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCard } from '@/app/shared/components/app-card/app-card';
import { AppCheckbox } from '@/app/shared/components/app-checkbox/app-checkbox';
import { ResponseService } from '@/app/core/services/response.service';
import { Folder } from '@/app/shared/models/folder.model';
import { Item } from '@/app/shared/models/item.model';
import { isFolder, isItem } from '@/app/shared/utils/type-guards';
import { AppButton } from '@/app/shared/components/app-button/app-button';

@Component({
  selector: 'item-selector',
  imports: [CommonModule, AppCard, AppCheckbox, AppButton],
  templateUrl: './item-selector.html',
})
export class ItemSelector implements OnInit {
  items = signal<(Folder | Item)[]>([]);

  constructor(private responseService: ResponseService) {}

  ngOnInit() {
    this.responseService.loadData().subscribe((items) => {
      this.items.set(items);
    });
  }

  selectedItemIds = computed(() => {
    const selectedIds: number[] = [];
    this.collectSelectedIds(this.items(), selectedIds);
    return selectedIds;
  });

  private collectSelectedIds(
    items: (Folder | Item)[],
    selectedIds: number[]
  ): void {
    items.forEach((item) => {
      if (isItem(item) && item.selected) {
        selectedIds.push(item.id);
      } else if (isFolder(item) && item.children) {
        this.collectSelectedIds(item.children, selectedIds);
      }
    });
  }

  clearSelection(): void {
    const currentItems = this.items();
    this.clearAllSelections(currentItems);
    this.items.set([...currentItems]);
  }

  private clearAllSelections(items: (Folder | Item)[]): void {
    items.forEach((item) => {
      if (isItem(item)) {
        item.selected = false;
      } else if (isFolder(item)) {
        item.selectedState = 'none';
        if (item.children) {
          this.clearAllSelections(item.children);
        }
      }
    });
  }

  onToggleExpanded(folderId: number): void {
    const currentItems = this.items();
    this.toggleFolderExpanded(currentItems, folderId);
    this.items.set([...currentItems]);
  }

  onToggleSelected(event: { id: number; type: 'folder' | 'item' }): void {
    const currentItems = this.items();
    if (event.type === 'folder') {
      this.toggleFolderSelection(currentItems, event.id);
    } else {
      this.toggleItemSelection(currentItems, event.id);
    }
    this.updateParentStates(currentItems);
    this.items.set([...currentItems]);
  }

  private toggleFolderExpanded(
    items: (Folder | Item)[],
    folderId: number
  ): boolean {
    return this.findAndUpdate(items, folderId, (item) => {
      if (isFolder(item)) {
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
      if (isFolder(item)) {
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
      if (isItem(item)) {
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
      if (isFolder(item) && item.children) {
        if (this.findAndUpdate(item.children, id, updateFn)) return true;
      }
    }
    return false;
  }

  private setFolderSelectionState(folder: Folder, state: 'none' | 'all'): void {
    folder.selectedState = state;
    folder.children?.forEach((child) => {
      if (isItem(child)) {
        child.selected = state === 'all';
      } else if (isFolder(child)) {
        this.setFolderSelectionState(child, state);
      }
    });
  }

  private updateParentStates(items: (Folder | Item)[]): void {
    items.forEach((item) => {
      if (isFolder(item) && item.children) {
        this.updateParentStates(item.children);

        const childItems = item.children.filter(isItem);
        const childFolders = item.children.filter(isFolder);

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
