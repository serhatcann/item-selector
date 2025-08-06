import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './app-button.html',
})
export class AppButton {
  type = input<'button' | 'submit'>('button');
  disabled = input<boolean>(false);
}
