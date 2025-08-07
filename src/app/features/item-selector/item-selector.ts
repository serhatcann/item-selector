import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCard } from '@/app/shared/components/app-card/app-card';
import { AppCheckbox } from '@/app/shared/components/app-checkbox/app-checkbox';
import { ResponseService } from '@/app/core/services/response.service';
import { Folder } from '@/app/shared/models/folder.model';
import { Item } from '@/app/shared/models/item.model';
import { isFolder, isItem } from '@/app/shared/utils/type-guards';
import { SelectedItemsList } from './selected-items-list/selected-items-list';
import { ClearSelection } from './clear-selection/clear-selection';

@Component({
  selector: 'item-selector',
  imports: [
    CommonModule,
    AppCard,
    AppCheckbox,
    SelectedItemsList,
    ClearSelection,
  ],
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
    for (const item of items) {
      if (isItem(item) && item.selected) {
        selectedIds.push(item.id);
      } else if (isFolder(item) && item.children) {
        this.collectSelectedIds(item.children, selectedIds);
      }
    }
  }

  clearSelection(): void {
    const currentItems = this.items();
    this.clearAllSelections(currentItems);
    this.items.set([...currentItems]);
  }

  private clearAllSelections(items: (Folder | Item)[]): void {
    for (const item of items) {
      if (isItem(item)) {
        item.selected = false;
      } else if (isFolder(item)) {
        item.selectedState = 'none';
        if (item.children) {
          this.clearAllSelections(item.children);
        }
      }
    }
  }

  onToggleExpanded(folderId: number): void {
    this.items.update((items) => {
      const folder = this.findFolder(items, folderId);
      if (folder) {
        folder.expanded = !folder.expanded;
      }
      return items;
    });
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
  ): void {
    const folder = this.findFolder(items, folderId);
    if (folder) {
      const newState = folder.selectedState === 'all' ? 'none' : 'all';
      this.setFolderSelectionState(folder, newState);
    }
  }

  private toggleItemSelection(items: (Folder | Item)[], itemId: number): void {
    const item = this.findItem(items, itemId);
    if (item) {
      item.selected = !item.selected;
    }
  }

  private findFolder(items: (Folder | Item)[], id: number): Folder | null {
    for (const item of items) {
      if (item.id === id && isFolder(item)) return item;
      if (isFolder(item) && item.children) {
        const found = this.findFolder(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  private findItem(items: (Folder | Item)[], id: number): Item | null {
    for (const item of items) {
      if (item.id === id && isItem(item)) return item;
      if (isFolder(item) && item.children) {
        const found = this.findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
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
        this.updateFolderState(item);
      }
    });
  }

  private updateFolderState(folder: Folder): void {
    if (!folder.children?.length) return;

    let allSelected = true;
    let someSelected = false;

    for (const child of folder.children) {
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

    folder.selectedState = allSelected
      ? 'all'
      : someSelected
      ? 'partial'
      : 'none';
  }
}
