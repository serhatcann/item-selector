import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppCard } from './shared/components/app-card/app-card';
import { AppButton } from './shared/components/app-button/app-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppCard, AppButton],
  templateUrl: './app.html',
})
export class App {
  onClick() {
    console.log('click');
  }
}
