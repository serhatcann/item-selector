import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCard } from '@/app/shared/components/app-card/app-card';
import { AppCheckbox } from '@/app/shared/components/app-checkbox/app-checkbox';
import { ResponseService } from '@/app/core/services/response.service';
import { Folder } from '@/app/shared/models/folder.model';
import { Item } from '@/app/shared/models/item.model';
import { isFolder, isItem } from '@/app/shared/utils/type-guards';

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
    this.responseService.loadData().subscribe((items) => {
      this.items = items;
      this.cdr.detectChanges();
    });
  }

  onToggleExpanded(folderId: number): void {
    this.toggleFolderExpanded(this.items, folderId);
  }

  onToggleSelected(event: { id: number; type: 'folder' | 'item' }): void {
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
