import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../models/folder.model';
import { Item } from '../../models/item.model';
import { isFolder } from '../../utils/type-guards';

type ToggleEvent = {
  id: number;
  type: 'folder' | 'item';
};

@Component({
  selector: 'app-checkbox',
  imports: [CommonModule],
  templateUrl: './app-checkbox.html',
})
export class AppCheckbox {
  @Input() item!: Folder | Item;
  @Input() level = 0;
  @Output() toggleExpanded = new EventEmitter<number>();
  @Output() toggleSelected = new EventEmitter<ToggleEvent>();

  isFolder = isFolder;

  onToggleExpanded() {
    if (isFolder(this.item)) {
      this.toggleExpanded.emit(this.item.id);
    }
  }

  onToggleSelected() {
    const type = isFolder(this.item) ? 'folder' : 'item';
    this.toggleSelected.emit({ id: this.item.id, type });
  }
}
