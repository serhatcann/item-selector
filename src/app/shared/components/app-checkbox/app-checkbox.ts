import { Component, input, output } from '@angular/core';
import { Folder } from '../../models/folder.model';
import { Item } from '../../models/item.model';
import { isFolder } from '../../utils/type-guards';

interface ToggleEvent {
  id: number;
  type: 'folder' | 'item';
}

@Component({
  selector: 'app-checkbox',
  templateUrl: './app-checkbox.html',
})
export class AppCheckbox {
  item = input.required<Folder | Item>();
  level = input(0);

  toggleExpanded = output<number>();
  toggleSelected = output<ToggleEvent>();

  isFolder = isFolder;

  isChecked(): boolean {
    const item = this.item();
    return isFolder(item) ? item.selectedState === 'all' : item.selected;
  }

  isIndeterminate(): boolean {
    const item = this.item();
    return isFolder(item) && item.selectedState === 'partial';
  }

  expandIcon(): string {
    const item = this.item();
    return isFolder(item) && item.expanded ? '▲' : '▼';
  }

  onToggleExpanded() {
    const item = this.item();
    if (isFolder(item)) {
      this.toggleExpanded.emit(item.id);
    }
  }

  onToggleSelected() {
    const item = this.item();
    const type = isFolder(item) ? 'folder' : 'item';
    this.toggleSelected.emit({ id: item.id, type });
  }
}
