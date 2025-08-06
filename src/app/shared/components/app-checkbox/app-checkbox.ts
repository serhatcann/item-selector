import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Folder } from '../../models/folder.model';
import { Item } from '../../models/item.model';

type ToggleEvent = {
  id: number;
  type: 'folder' | 'item';
};

@Component({
  selector: 'app-checkbox',
  imports: [CommonModule],
  templateUrl: './app-checkbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppCheckbox {
  @Input() item!: Folder | Item;
  @Input() level = 0;
  @Output() toggleExpanded = new EventEmitter<number>();
  @Output() toggleSelected = new EventEmitter<ToggleEvent>();

  isFolder(item: Folder | Item): item is Folder {
    return 'children' in item;
  }

  onToggleExpanded() {
    if (this.isFolder(this.item)) {
      this.toggleExpanded.emit(this.item.id);
    }
  }

  onToggleSelected() {
    const type = this.isFolder(this.item) ? 'folder' : 'item';
    this.toggleSelected.emit({ id: this.item.id, type });
  }
}
