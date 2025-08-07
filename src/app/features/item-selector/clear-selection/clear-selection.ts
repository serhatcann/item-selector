import { Component, input, output } from '@angular/core';
import { AppButton } from '@/app/shared/components/app-button/app-button';

@Component({
  selector: 'clear-selection',
  imports: [AppButton],
  templateUrl: './clear-selection.html',
})
export class ClearSelection {
  hasSelection = input.required<boolean>();
  clearSelection = output<void>();
}
