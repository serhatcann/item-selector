import { Component, input } from '@angular/core';

@Component({
  selector: 'selected-items-list',
  templateUrl: './selected-items-list.html',
})
export class SelectedItemsList {
  selectedIds = input.required<number[]>();
}