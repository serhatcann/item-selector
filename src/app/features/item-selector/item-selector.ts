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
  treeData: (Folder | Item)[] = [];

  constructor(
    private responseService: ResponseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.responseService.loadData().subscribe(({ folders, items }) => {
      this.treeData = this.buildTree(folders, items);
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
    this.toggleFolderExpanded(this.treeData, folderId);
  }

  onToggleSelected(event: { id: number; type: 'folder' | 'item' }) {
    if (event.type === 'folder') {
      this.toggleFolderSelection(this.treeData, event.id);
    } else {
      this.toggleItemSelection(this.treeData, event.id);
      this.updateParentStates(this.treeData);
    }
    this.cdr.detectChanges();
  }

  private toggleFolderExpanded(
    items: (Folder | Item)[],
    folderId: number
  ): boolean {
    for (const item of items) {
      if ('children' in item) {
        if (item.id === folderId) {
          item.expanded = !item.expanded;
          return true;
        }
        if (this.toggleFolderExpanded(item.children || [], folderId)) {
          return true;
        }
      }
    }
    return false;
  }

  private toggleFolderSelection(
    items: (Folder | Item)[],
    folderId: number
  ): boolean {
    for (const item of items) {
      if ('children' in item) {
        if (item.id === folderId) {
          const newState = item.selectedState === 'all' ? 'none' : 'all';
          this.setFolderSelectionState(item, newState);
          return true;
        }
        if (this.toggleFolderSelection(item.children || [], folderId)) {
          return true;
        }
      }
    }
    return false;
  }

  private toggleItemSelection(
    items: (Folder | Item)[],
    itemId: number
  ): boolean {
    for (const item of items) {
      if ('selected' in item && item.id === itemId) {
        item.selected = !item.selected;
        return true;
      }
      if (
        'children' in item &&
        this.toggleItemSelection(item.children || [], itemId)
      ) {
        return true;
      }
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
    items.forEach(item => {
      if ('children' in item && item.children) {
        this.updateParentStates(item.children);
        
        const childItems = item.children.filter(child => 'selected' in child) as Item[];
        const childFolders = item.children.filter(child => 'children' in child) as Folder[];
        
        const allItemsSelected = childItems.every(child => child.selected);
        const allFoldersSelected = childFolders.every(child => child.selectedState === 'all');
        const someItemsSelected = childItems.some(child => child.selected);
        const someFoldersSelected = childFolders.some(child => child.selectedState === 'all' || child.selectedState === 'partial');
        
        if (allItemsSelected && allFoldersSelected && childItems.length + childFolders.length > 0) {
          item.selectedState = 'all';
        } else if (someItemsSelected || someFoldersSelected) {
          item.selectedState = 'partial';
        } else {
          item.selectedState = 'none';
        }
      }
    });
  }
}
