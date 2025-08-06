import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
  selectedItemIds = computed(() => {
    const selectedIds: number[] = [];
    this.collectSelectedIds(this.items(), selectedIds);
    return selectedIds;
  });

  private responseService = inject(ResponseService);

  ngOnInit() {
    this.responseService.loadData().subscribe((items) => {
      this.items.set(items);
    });
  }

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
    this.items.update((items) => {
      this.toggleFolderExpanded(items, folderId);
      return items;
    });
  }

  private toggleFolderExpanded(
    items: (Folder | Item)[],
    folderId: number
  ): boolean {
    for (const item of items) {
      if (item.id === folderId && isFolder(item)) {
        item.expanded = !item.expanded;
        return true;
      }
      if (
        isFolder(item) &&
        item.children &&
        this.toggleFolderExpanded(item.children, folderId)
      ) {
        return true;
      }
    }
    return false;
  }

  onToggleSelected(event: { id: number; type: 'folder' | 'item' }): void {
    this.items.update((items) => {
      if (event.type === 'folder') {
        this.toggleFolderSelection(items, event.id);
      } else {
        this.toggleItemSelection(items, event.id);
      }
      this.updateParentStates(items);
      return [...items];
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
      if (isFolder(item) && item.children?.length) {
        this.updateParentStates(item.children);

        let allSelected = true;
        let someSelected = false;

        for (const child of item.children) {
          if (isItem(child)) {
            if (child.selected) someSelected = true;
            else allSelected = false;
          } else if (isFolder(child)) {
            if (child.selectedState === 'all') someSelected = true;
            else if (child.selectedState === 'partial') {
              someSelected = true;
              allSelected = false;
            } else allSelected = false;
          }
        }

        item.selectedState = allSelected
          ? 'all'
          : someSelected
          ? 'partial'
          : 'none';
      }
    });
  }
}
